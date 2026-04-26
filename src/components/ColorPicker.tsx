interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

const PRESET_COLORS = [
  // ROJOS Y GRANATES
  '#800000', '#a52a2a', '#b22222', '#c92a2a', '#e03131', '#f03e3e', '#fa5252', '#dc143c', '#ff0000',
  
  // NARANJAS Y CORALES
  '#e8590c', '#d9480f', '#f76707', '#fd7e14', '#ff4500', '#ff6347', '#ff7f50', '#ff922b', '#ffa94d',

  // AMARILLOS Y DORADOS
  '#f08c00', '#e67700', '#f59f00', '#fab005', '#fcc419', '#ffd700', '#ffea00',
  
  // VERDES
  '#5c940d', '#66a80f', '#74b816', '#82c91e', '#2b8a3e', '#2f9e44', '#37b24d', '#087f5b', '#099268', '#0ca678', '#12b886', '#20c997',

  // TEALES Y TURQUESAS
  '#0b7285', '#1098ad', '#15aabf', '#22b8cf', '#008b8b', '#00ced1', '#20b2aa', '#0c85d0',

  // AZULES
  '#003d80', '#0052a3', '#0066cc', '#1864ab', '#1971c2', '#1c7ed6', '#228be6', '#007bff',

  // VIOLETAS Y PURPURAS
  '#4b0082', '#5f3dc4', '#6741d9', '#7048e8', '#7950f2', '#862e9c', '#8a2be2', '#9400d3', '#9932cc',

  // ROSAS Y MAGENTAS
  '#a61e4d', '#c2255c', '#d6336c', '#e64980', '#f06595', '#ff1493',

  // MARRONES Y TIERRAS
  '#5c4033', '#8b4513', '#a0522d', '#cd853f', '#d2691e',

  // GRISES Y NEGROS
  '#495057', '#343a40', '#212529', '#1a1a1a', '#000000'
];

export default function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(24px, 1fr))',
      gap: '10px',
      marginTop: '10px',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      maxHeight: '180px',
      overflowY: 'auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {PRESET_COLORS.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: color,
            border: selectedColor === color ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
            cursor: 'pointer',
            padding: 0,
            transition: 'transform 0.15s ease',
            transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
            boxShadow: selectedColor === color ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
          }}
          title={color}
        />
      ))}
    </div>
  );
}
