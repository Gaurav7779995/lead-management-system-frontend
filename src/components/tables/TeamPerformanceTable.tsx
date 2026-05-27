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
  LinearProgress
} from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

interface TeamPerformanceTableProps {
  data: Array<{
    agent: {
      name: string;
      email: string;
    };
    totalLeads: number;
    convertedLeads: number;
  }>;
}

const TeamPerformanceTable: React.FC<TeamPerformanceTableProps> = ({ data }) => {
  const getConversionRate = (total: number, converted: number) => {
    if (total === 0) return 0;
    return Math.round((converted / total) * 100);
  };

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 50) return <TrendingUp color="success" />;
    if (rate >= 25) return <TrendingDown color="warning" />;
    return <TrendingDown color="error" />;
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 50) return 'success';
    if (rate >= 25) return 'warning';
    return 'error';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 50) return '#10b981';
    if (rate >= 25) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Agent
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Total Leads
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Converted
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Conversion Rate
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
              Performance
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((agent) => {
            const conversionRate = getConversionRate(agent.totalLeads, agent.convertedLeads);
            return (
              <TableRow 
                key={agent.agent.email}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {agent.agent.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agent.agent.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {agent.totalLeads}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    {agent.convertedLeads}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Box sx={{ width: 60 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={conversionRate} 
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getProgressColor(conversionRate),
                            borderRadius: 3,
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {conversionRate}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {getPerformanceIcon(conversionRate)}
                    <Chip 
                      label={conversionRate >= 50 ? 'Excellent' : conversionRate >= 25 ? 'Good' : 'Needs Improvement'}
                      size="small"
                      color={getPerformanceColor(conversionRate) as any}
                      variant="outlined"
                    />
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamPerformanceTable;
