import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Initial state
const initialState = {
  campaigns: [],
  currentCampaign: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCampaigns: 0,
    perPage: 10,
  },
};

// Async thunk for fetching campaigns
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/campaigns', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for fetching a single campaign
export const fetchCampaign = createAsyncThunk(
  'campaigns/fetchCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for creating a campaign
export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData, { rejectWithValue }) => {
    try {
      const response = await api.post('/campaigns', campaignData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for updating a campaign
export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ id, campaignData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/campaigns/${id}`, campaignData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for deleting a campaign
export const deleteCampaign = createAsyncThunk(
  'campaigns/deleteCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/campaigns/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for starting a campaign
export const startCampaign = createAsyncThunk(
  'campaigns/startCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/campaigns/${id}/start`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for stopping a campaign
export const stopCampaign = createAsyncThunk(
  'campaigns/stopCampaign',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/campaigns/${id}/stop`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Campaigns slice
const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
    },
    clearCampaignsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch campaigns cases
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.campaigns;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalCampaigns: action.payload.totalCampaigns,
          perPage: action.payload.perPage,
        };
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch campaigns';
      })
      // Fetch campaign cases
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch campaign';
      })
      // Create campaign cases
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.unshift(action.payload);
        state.currentCampaign = action.payload;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create campaign';
      })
      // Update campaign cases
      .addCase(updateCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
        const index = state.campaigns.findIndex(campaign => campaign._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update campaign';
      })
      // Delete campaign cases
      .addCase(deleteCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = state.campaigns.filter(campaign => campaign._id !== action.payload._id);
        if (state.currentCampaign && state.currentCampaign._id === action.payload._id) {
          state.currentCampaign = null;
        }
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete campaign';
      })
      // Start campaign cases
      .addCase(startCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
        const index = state.campaigns.findIndex(campaign => campaign._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(startCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to start campaign';
      })
      // Stop campaign cases
      .addCase(stopCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
        const index = state.campaigns.findIndex(campaign => campaign._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(stopCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to stop campaign';
      });
  },
});

export const { clearCurrentCampaign, clearCampaignsError } = campaignsSlice.actions;

export default campaignsSlice.reducer;