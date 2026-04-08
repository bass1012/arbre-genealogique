// src/components/PersonNode.tsx
import React from 'react';

interface PersonNodeProps {
  node: any;
  isRoot: boolean;
  style?: React.CSSProperties;
}

const PersonNode: React.FC<PersonNodeProps> = ({ node, isRoot, style }) => {
  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        width: 180,
        height: 200,
        transform: 'translate(-50%, -50%)',
        backgroundColor: isRoot ? '#e3f2fd' : '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #90caf9',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ 
        width: '60px', 
        height: '60px', 
        borderRadius: '50%', 
        backgroundColor: '#90caf9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '20px'
      }}>
        {node.name && node.name[0]}
      </div>
      <div style={{ 
        textAlign: 'center',
        fontWeight: isRoot ? 'bold' : 'normal'
      }}>
        <div>{node.name}</div>
        {node.birthDate && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            {new Date(node.birthDate).getFullYear()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonNode;