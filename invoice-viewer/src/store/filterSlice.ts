import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

const initialState: FilterState = {
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
};

export const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateFrom: (state, action: PayloadAction<string>) => {
      state.dateFrom = action.payload;
    },
    setDateTo: (state, action: PayloadAction<string>) => {
      state.dateTo = action.payload;
    },
    setMinAmount: (state, action: PayloadAction<string>) => {
      state.minAmount = action.payload;
    },
    setMaxAmount: (state, action: PayloadAction<string>) => {
      state.maxAmount = action.payload;
    },
    resetFilters: (state) => {
      state.dateFrom = '';
      state.dateTo = '';
      state.minAmount = '';
      state.maxAmount = '';
    },
  },
});

export const { setDateFrom, setDateTo, setMinAmount, setMaxAmount, resetFilters } = filterSlice.actions;

export default filterSlice.reducer;
