
import { useState, useEffect } from "react";
import { Mouse } from "lucide-react";

interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
}

interface LiveCursorsProps {
  cursors: CursorPosition[];
  currentUserId: string;
  containerRef: React.RefObject<HTMLElement>;
}

export const LiveCursors = ({ cursors, currentUserId, containerRef }: LiveCursorsProps) => {
  const [visibleCursors, setVisibleCursors] = useState<CursorPosition[]>([]);

  useEffect(() => {
    // Filter out current user's cursor and old cursors (older than 10 seconds)
    const now = Date.now();
    const filtered = cursors.filter(cursor => 
      cursor.userId !== currentUserId && 
      (now - cursor.timestamp) < 10000
    );
    setVisibleCursors(filtered);
  }, [cursors, currentUserId]);

  if (!containerRef.current || visibleCursors.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {visibleCursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Cursor icon */}
          <div className="relative">
            <Mouse 
              className="h-5 w-5 rotate-12" 
              style={{ color: cursor.userColor }}
              fill={cursor.userColor}
            />
            
            {/* User name label */}
            <div 
              className="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.userColor }}
            >
              {cursor.userName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
