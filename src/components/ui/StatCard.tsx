import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { StatusColor } from '../../utils/status';

interface StatCardProps {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
  icon: ReactNode;
  color?: StatusColor | 'primary';
}

/** Headline metric tile used across the top of the dashboard. */
export function StatCard({ label, value, caption, icon, color = 'primary' }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.06), 0 18px 32px -22px rgba(15, 23, 42, 0.45)',
        },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Box
            sx={(theme) => {
              const main =
                color === 'default' ? theme.palette.text.secondary : theme.palette[color].main;
              return {
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                color: main,
                backgroundColor: `color-mix(in srgb, ${main} 12%, transparent)`,
                '& svg': { fontSize: 22 },
              };
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.6, fontSize: 11 }}
            >
              {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25, wordBreak: 'break-word' }}>
              {value}
            </Typography>
            {caption && (
              <Box sx={{ mt: 0.75 }}>
                {typeof caption === 'string' ? (
                  <Typography variant="body2" color="text.secondary">
                    {caption}
                  </Typography>
                ) : (
                  caption
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
