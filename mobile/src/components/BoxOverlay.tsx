import React, { useState } from 'react';
import { Dimensions, Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import type { Detection } from '../ml/types';
import { C, R } from '../theme';

const screenH = Dimensions.get('window').height;

/** Image + tappable bounding boxes. Boxes are normalised, so they stay exact at any display size. */
export function BoxOverlay({
  uri,
  imageW,
  imageH,
  detections,
  selectedId,
  onSelect,
  maxHeight = Math.min(360, Math.round(screenH * 0.36)),
}: {
  uri: string;
  imageW: number;
  imageH: number;
  detections: Detection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  maxHeight?: number;
}) {
  const [avail, setAvail] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setAvail(e.nativeEvent.layout.width);
  const scale = avail > 0 && imageW > 0 && imageH > 0
    ? Math.min(avail / imageW, maxHeight / imageH)
    : 0;
  const w = Math.round(imageW * scale);
  const h = Math.round(imageH * scale);

  return (
    <View onLayout={onLayout} style={styles.container}>
      {avail > 0 && w > 0 && h > 0 && (
        <View style={[styles.imageContainer, { width: w, height: h }]}>
          <Image source={{ uri }} style={{ width: w, height: h }} resizeMode="stretch" />
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            {detections
              .filter((d) => !d.removed)
              .map((d) => {
                const sel = d.id === selectedId;
                const low = d.score < 0.5;
                const col = sel ? '#1565C0' : low ? C.warn : '#2E7D32';
                const x = d.bbox.x * w;
                const y = d.bbox.y * h;
                const bw = d.bbox.w * w;
                const bh = d.bbox.h * h;
                const label = `${d.emoji} ${d.label} ${Math.round(d.score * 100)}%${
                  low ? ' ⚠️' : ''
                }`;
                const lw = Math.min(label.length * 6.8 + 14, Math.max(bw, 96));
                // Clamp badge horizontally so it never clips past left or right edges
                const labelX = Math.max(2, Math.min(x, Math.max(2, w - lw - 2)));
                // If box is near the top edge, tuck badge neatly inside the box to prevent cut-off
                const labelY = y < 22 ? Math.min(y + 2, Math.max(0, h - 22)) : Math.max(2, y - 22);

                return (
                  <G key={d.id} onPress={() => onSelect(sel ? null : d.id)}>
                    <Rect
                      x={x}
                      y={y}
                      width={bw}
                      height={bh}
                      stroke={col}
                      strokeWidth={sel ? 3.5 : 2.2}
                      fill={col}
                      fillOpacity={sel ? 0.22 : 0.08}
                      rx={4}
                    />
                    <Rect
                      x={labelX}
                      y={labelY}
                      width={lw}
                      height={20}
                      fill={col}
                      rx={4}
                    />
                    <SvgText
                      x={labelX + 5}
                      y={labelY + 14}
                      fontSize={11}
                      fontWeight="bold"
                      fill="#FFFFFF"
                    >
                      {label.slice(0, 30)}
                    </SvgText>
                  </G>
                );
              })}
          </Svg>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    borderRadius: R.lg,
    overflow: 'hidden',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: C.border,
  },
});
