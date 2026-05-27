import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box,
  Chip,
  Button
} from "@mui/material";
import { AccessTime, Phone, Email } from "@mui/icons-material";

interface FollowUpTableProps {
  data: Array<{
    name: string;
    email?: string;
    phone?: string;
    followUps: Array<{
      date: string;
      note: string;
      status: string;
    }>;
  }>;
}

const FollowUpTable: React.FC<FollowUpTableProps> = ({ data }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: any } = {
      'pending': 'warning',
      'completed': 'success',
      'missed': 'error'
    };
    return colors[status] || 'default';
  };

  const getTodayFollowUps = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const followUps = [];
    data.forEach(lead => {
      lead.followUps?.forEach(followUp => {
        const followUpDate = new Date(followUp.date);
        if (followUpDate >= today && followUpDate < tomorrow) {
          followUps.push({
            ...lead,
            followUp
          });
        }
      });
    });

    return followUps.sort((a, b) => 
      new Date(a.followUp.date).getTime() - new Date(b.followUp.date).getTime()
    );
  };

  const todayFollowUps = getTodayFollowUps();

  if (todayFollowUps.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <AccessTime sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No follow-ups scheduled for today
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enjoy your day! Check back tomorrow for scheduled follow-ups.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Lead
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Time
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Note
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todayFollowUps.map((item, index) => (
            <TableRow 
              key={index}
              sx={{ 
                '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {item.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    {item.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.email}
                        </Typography>
                      </Box>
                    )}
                    {item.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {formatTime(item.followUp.date)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ maxWidth: 200 }}>
                  {item.followUp.note}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={item.followUp.status.toUpperCase()}
                  size="small"
                  color={getStatusColor(item.followUp.status)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => {
                      // Handle complete follow-up
                    }}
                  >
                    Complete
                  </Button>
                  <Button 
                    size="small" 
                    variant="text"
                    onClick={() => {
                      // Handle reschedule
                    }}
                  >
                    Reschedule
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FollowUpTable;
