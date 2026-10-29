import bundled from '../../assets/model/labels.json';

export interface LabelSet { version: string; inputSize: number; names: string[] }
export const bundledLabels: LabelSet = {
  version: (bundled as any).version ?? 'bundled',
  inputSize: (bundled as any).input_size ?? 640,
  names: (bundled as any).names as string[],
};
