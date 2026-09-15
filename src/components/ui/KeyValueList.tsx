import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

interface KeyValueListProps {
  items: KeyValueItem[];
  /** Two columns on wide screens, one on mobile. */
  columns?: 1 | 2;
}

export function KeyValueList({ items, columns = 1 }: KeyValueListProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: columns === 2 ? '1fr 1fr' : '1fr' },
        columnGap: 3,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 2,
            py: 1.15,
            borderBottom: '1px dashed',
            borderColor: 'divider',
            '&:last-of-type': { borderBottom: 'none' },
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            {item.label}
          </Typography>
          <Box sx={{ minWidth: 0, textAlign: 'right' }}>
            {typeof item.value === 'string' || typeof item.value === 'number' ? (
              <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                {item.value}
              </Typography>
            ) : (
              item.value
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
