/**
 * On-device YOLOv8 inference with onnxruntime-react-native. Works with ZERO network.
 *
 *   photo -> (1) bake EXIF + downscale -> (2) letterbox-resize -> JPEG decode (jpeg-js) -> CHW float tensor
 *         -> ORT session.run -> decodeYolov8 (NMS, alternatives) -> normalised detections
 */
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Platform } from 'react-native';
import { checkForModelUpdate, resolveBundled, resolveModel, ResolvedModel, revertToBundled, UpdateResult } from './modelManager';
import { decodeYolov8, Letterbox, RawDetection } from './postprocess';
import { fillTensor, makeLetterbox, targetSize } from './preprocess';
import type { ModelInfo, ScanTimings } from './types';

const now = () => (globalThis.performance?.now?.() ?? Date.now());

export interface PreparedImage { uri: string; width: number; height: number; ms: number }

/** Step 1: orientation-correct, bounded-size copy. Used for display and as the source for step 2. */
export async function prepareImage(uri: string, maxSide = 1280): Promise<PreparedImage> {
  const t = now();
  // Resizing by width bakes EXIF rotation into pixels; the result's real width/height are what we normalise against.
  const r = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: maxSide } }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
  return { uri: r.uri, width: r.width, height: r.height, ms: now() - t };
}

class OnDeviceDetector {
  private session: InferenceSession | null = null;
  private model: ResolvedModel | null = null;
  private inputName = 'images';
  private outputName = 'output0';
  private size = 640;
  private tensorBuf: Float32Array | null = null; // reused while the canvas size stays the same
  private chain: Promise<unknown> = Promise.resolve();
  private loading: Promise<ModelInfo> | null = null;
  info: ModelInfo | null = null;

  get ready() { return this.session !== null; }
  get names() { return this.model?.labels.names ?? []; }
  get version() { return this.model?.version ?? 'none'; }

  private async createSession(m: ResolvedModel, accel: 'cpu' | 'auto') {
    const providers: InferenceSession.ExecutionProviderConfig[] =
      accel === 'auto' ? [Platform.OS === 'ios' ? 'coreml' : 'nnapi', 'cpu'] : ['cpu'];
    try {
      return { s: await InferenceSession.create(m.path, { executionProviders: providers, graphOptimizationLevel: 'all', intraOpNumThreads: 4 }), provider: providers[0] as string };
    } catch (e) {
      if (accel === 'auto') return { s: await InferenceSession.create(m.path, { executionProviders: ['cpu'], graphOptimizationLevel: 'all' }), provider: 'cpu' };
      throw e;
    }
  }

  /** Load + warm up. Safe to call repeatedly; concurrent callers share one load. */
  init(accel: 'cpu' | 'auto' = 'cpu', force = false): Promise<ModelInfo> {
    if (this.loading) return this.loading;
    if (this.session && this.info && !force) return Promise.resolve(this.info);
    this.loading = (async () => {
      let m: ResolvedModel;
      try { m = await resolveModel(); } catch { m = await resolveBundled(); }
      let made;
      try { made = await this.createSession(m, accel); }
      catch (e) {
        if (m.source === 'ota') { await revertToBundled(); m = await resolveBundled(); made = await this.createSession(m, accel); } // corrupt OTA -> bundled
        else throw e;
      }
      this.session = made.s; this.model = m;
      this.inputName = made.s.inputNames[0]; this.outputName = made.s.outputNames[0];
      this.size = m.labels.inputSize || 640;
      const wh = Math.round((this.size * 3) / 4 / 32) * 32; // warm-up on a typical 4:3 rectangular canvas (e.g. 640x480)
      const warm = new Float32Array(3 * wh * this.size).fill(114 / 255);
      const t = now();
      await made.s.run({ [this.inputName]: new Tensor('float32', warm, [1, 3, wh, this.size]) });
      this.info = { version: m.version, source: m.source, inputSize: this.size, numClasses: m.labels.names.length, warmupMs: Math.round(now() - t), provider: made.provider };
      return this.info;
    })().finally(() => { this.loading = null; });
    return this.loading;
  }

  /** Serialise runs: one shared tensor buffer, one session. */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const p = this.chain.then(fn, fn);
    this.chain = p.catch(() => undefined);
    return p;
  }

  detect(img: PreparedImage, conf: number, iou: number): Promise<{ raw: RawDetection[]; timings: ScanTimings }> {
    return this.enqueue(async () => {
      if (!this.session) await this.init();
      const S = this.size;
      const t0 = now();
      const tgt = targetSize(img.width, img.height, S);
      const small = await ImageManipulator.manipulateAsync(img.uri, [{ resize: { width: tgt.w, height: tgt.h } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true });
      const dec = jpeg.decode(Buffer.from(small.base64!, 'base64'), { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 256 });
      const lb: Letterbox = makeLetterbox(img.width, img.height, dec.width, dec.height, S);
      const need = 3 * lb.canvasW * lb.canvasH;
      if (!this.tensorBuf || this.tensorBuf.length !== need) this.tensorBuf = new Float32Array(need);
      fillTensor(dec.data, dec.width, dec.height, 4, lb, this.tensorBuf);
      const t1 = now();
      const out = await this.session!.run({ [this.inputName]: new Tensor('float32', this.tensorBuf, [1, 3, lb.canvasH, lb.canvasW]) });
      const o = out[this.outputName];
      const t2 = now();
      const raw = decodeYolov8(o.data as Float32Array, o.dims as number[], this.names.length, lb, { conf, iou });
      const t3 = now();
      return { raw, timings: { prepare: Math.round(img.ms + (t1 - t0)), inference: Math.round(t2 - t1), postprocess: Math.round(t3 - t2) } };
    });
  }

  /** OTA update; the new file is validated by loading it in a throw-away session first. */
  async updateModel(onProgress?: (p: number) => void): Promise<UpdateResult> {
    const res = await checkForModelUpdate(this.version, async (m) => {
      const s = await InferenceSession.create(m.path, { executionProviders: ['cpu'] });
      const z = new Float32Array(3 * 480 * 640).fill(114 / 255);
      await s.run({ [s.inputNames[0]]: new Tensor('float32', z, [1, 3, 480, 640]) });
    }, onProgress);
    if (res.status === 'downloaded') await this.init('cpu', true);
    return res;
  }
}

export const onDeviceDetector = new OnDeviceDetector();
