import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  /** Rendered on the right of the header — filters, links, counts. */
  action?: ReactNode;
  children: ReactNode;
  /** Drop the inner padding when the body is a full-bleed table. */
  disableContentPadding?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  disableContentPadding = false,
}: SectionCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: { xs: 2, sm: 2.75 }, py: 2 }}>
        <Stack
          direction="row"

          spacing={2}

          useFlexGap
          sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      </Box>
      <Divider />
      {disableContentPadding ? (
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
      ) : (
        <CardContent sx={{ flexGrow: 1 }}>{children}</CardContent>
      )}
    </Card>
  );
}
