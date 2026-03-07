import { useEffect, useRef, useState } from 'react';
import type { OfficeState } from '../office/engine/officeState.js';

// Palette shirt colors — must match defaultCharacters.ts palettes
const PALETTE_COLORS = [
  '#4169E1', // blue
  '#DC143C', // red
  '#32CD32', // green
  '#9370DB', // purple
  '#FF8C00', // orange
  '#20B2AA', // teal
];

interface AgentLabelsProps {
  officeState: OfficeState;
  zoom: number;
  panRef: React.RefObject<{ x: number; y: number }>;
  onAgentClick?: (agentId: string, screenX: number, screenY: number) => void;
}

interface LabelPosition {
  agentId: string;
  name: string;
  role: string;
  x: number;
  y: number;
  avatarX: number;
  avatarY: number;
  isActive: boolean;
  bubbleType: 'permission' | 'waiting' | null;
  isSelected: boolean;
  palette: number;
}

export function AgentLabels({ officeState, zoom, panRef, onAgentClick }: AgentLabelsProps) {
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updatePositions = () => {
      const positions: LabelPosition[] = [];
      for (const [agentId, char] of officeState.characters) {
        const screenX = char.x * zoom + panRef.current!.x;
        const screenY = char.y * zoom + panRef.current!.y - 30 * zoom;
        // Avatar position: centered on the character's tile position
        const avatarX = char.col * 16 * zoom + panRef.current!.x;
        const avatarY = char.row * 16 * zoom + panRef.current!.y;
        positions.push({
          agentId,
          name: char.name || agentId,
          role: char.role || '',
          x: screenX,
          y: screenY,
          avatarX,
          avatarY,
          isActive: char.active,
          bubbleType: char.bubbleState.type === 'none' ? null : (char.bubbleState.type as 'permission' | 'waiting'),
          isSelected: officeState.selectedAgentId === agentId,
          palette: char.palette,
        });
      }
      setLabelPositions(positions);
      rafRef.current = requestAnimationFrame(updatePositions);
    };
    rafRef.current = requestAnimationFrame(updatePositions);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [officeState, zoom, panRef]);

  const avatarSize = Math.max(12, 16 * zoom);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      {labelPositions.map((pos) => {
        let dotColor = 'transparent';
        let dotClass = '';
        if (pos.bubbleType === 'waiting') {
          dotColor = '#facc15';
        } else if (pos.isActive) {
          dotColor = '#60a5fa';
          dotClass = 'pixel-agents-pulse';
        }

        const baseColor = PALETTE_COLORS[pos.palette % PALETTE_COLORS.length];

        return (
          <div key={pos.agentId}>
            {/* Colored character avatar box */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onAgentClick?.(pos.agentId, e.clientX, e.clientY);
              }}
              style={{
                position: 'absolute',
                left: pos.avatarX,
                top: pos.avatarY,
                width: avatarSize,
                height: avatarSize * 1.5,
                background: baseColor,
                border: pos.isSelected ? '2px solid #fbbf24' : '2px solid rgba(255,255,255,0.5)',
                borderRadius: `${Math.max(2, avatarSize * 0.2)}px ${Math.max(2, avatarSize * 0.2)}px 2px 2px`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                cursor: 'pointer',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflow: 'hidden',
              }}
            >
              {/* Head */}
              <div
                style={{
                  width: avatarSize * 0.55,
                  height: avatarSize * 0.55,
                  borderRadius: '50%',
                  background: '#FDBCB4',
                  marginTop: avatarSize * 0.1,
                  border: '1px solid rgba(0,0,0,0.2)',
                }}
              />
            </div>
            {/* Name label (clickable) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onAgentClick?.(pos.agentId, e.clientX, e.clientY);
              }}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                transform: 'translateX(-50%)',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 600,
                color: pos.isSelected ? '#fbbf24' : '#fff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  className={dotClass}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dotColor,
                    flexShrink: 0,
                  }}
                />
                <span>{pos.name}</span>
              </div>
              {pos.role && <div style={{ fontSize: '9px', opacity: 0.8 }}>{pos.role}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
