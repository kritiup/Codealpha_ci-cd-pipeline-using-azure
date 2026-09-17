import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <Box>
      <PageHeader title="Page not found" />
      <EmptyState
        title="That page does not exist"
        description="Check the address, or head back to the deployment dashboard."
        action={
          <Button variant="contained" component={RouterLink} to="/">
            Back to dashboard
          </Button>
        }
      />
    </Box>
  );
}
