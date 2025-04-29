import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { authAPI } from '../config/api'; // Ensure this is your API config

const Registercon = () => {
  const navigate = useNavigate();
  const [step1Data, setStep1Data] = useState(null);
  const [formData, setFormData] = useState({
    nonCurrentAssets: '',
    liabilities: '',
    equity: '',
    nonCurrentAssetsDesc: '',
    liabilitiesDesc: '',
    equityDesc: '',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedStep1 = localStorage.getItem('registerStep1');
    if (storedStep1) {
      setStep1Data(JSON.parse(storedStep1));
    } else {
      navigate('/register'); // Fallback if someone comes here directly
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (['nonCurrentAssets', 'liabilities', 'equity'].includes(name)) {
      formattedValue = value.replace(/\D/g, '');

      if (formattedValue === '') {
        formattedValue = '0';
      }

      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, -2) + '.' + formattedValue.slice(-2);
      } else if (formattedValue.length === 1) {
        formattedValue = '0.0' + formattedValue;
      } else if (formattedValue.length === 2) {
        formattedValue = '0.' + formattedValue;
      }

      formattedValue = formattedValue.replace(/^0+/, '');
    }

    setFormData({ ...formData, [name]: formattedValue });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fullFormData = {
        ...step1Data,
        ...formData
      };

      // Call the backend API to register the data
      const response = await authAPI.registerSecondPage(fullFormData); // Make sure this matches your backend API
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Clear step 1 data after successful registration
      localStorage.removeItem('registerStep1');

      // Redirect to subscription page
      navigate('/subscription'); // Make sure this route is set up correctly in your router
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 3,
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: '40%', width: '100%', boxShadow: 3, color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box component='form' onSubmit={handleSubmit} noValidate>
            <Typography variant='h4' component='h1' gutterBottom align='center' sx={{ mb: 4 }}>
              Additional Details
            </Typography>

            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel id='currency-label'>Currency</InputLabel>
              <Select
                labelId='currency-label'
                name='currency'
                value={formData.currency}
                onChange={handleChange}
                label='Currency'
              >
                <MenuItem value='USD'>US Dollar USD</MenuItem>
                <MenuItem value='LKR'>Sri Lankan Rupees LKR</MenuItem>
                <MenuItem value='INR'>Indian Rupees INR</MenuItem>
                <MenuItem value='CAD'>Canadian Dollar CAD</MenuItem>
                <MenuItem value='AUD'>Australian Dollar AUD</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin='normal'
              required
              fullWidth
              name='nonCurrentAssets'
              label='Non-Current Assets'
              value={formData.nonCurrentAssets}
              onChange={handleChange}
              inputProps={{ pattern: '^[0-9]*$', maxLength: 12 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin='normal'
              fullWidth
              name='nonCurrentAssetsDesc'
              label='Non-Current Assets Description (Optional)'
              value={formData.nonCurrentAssetsDesc}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <TextField
              margin='normal'
              required
              fullWidth
              name='liabilities'
              label='Liabilities'
              value={formData.liabilities}
              onChange={handleChange}
              inputProps={{ pattern: '^[0-9]*$', maxLength: 12 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin='normal'
              fullWidth
              name='liabilitiesDesc'
              label='Liabilities Description (Optional)'
              value={formData.liabilitiesDesc}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <TextField
              margin='normal'
              required
              fullWidth
              name='equity'
              label='Equity'
              value={formData.equity}
              onChange={handleChange}
              inputProps={{ pattern: '^[0-9]*$', maxLength: 12 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin='normal'
              fullWidth
              name='equityDesc'
              label='Equity Description (Optional)'
              value={formData.equityDesc}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <Button
              type='submit'
              fullWidth
              variant='contained'
              disabled={loading}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? 'updating...' : 'Register'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Go back to{' '}
                <Link to='/register' style={{ color: 'primary.main', textDecoration: 'none' }}>
                  previous step
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Registercon;
