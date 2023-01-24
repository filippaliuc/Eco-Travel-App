import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    origin: null,
    destination: null,
    googleDirection: null,
}

export const navSlice = createSlice ({
    name: 'nav',
    initialState,
    reducers: {
        setOrigin: (state, action) => {
            state.origin = action.payload;
        },
        setDestination: (state, action) => {
            state.destination = action.payload;
        },
        setGoogleDirection: (state, action) => {
            state.googleDirection = action.payload;
        },
    },
});

export const { setOrigin, setDestination, setGoogleDirection} = navSlice.actions;

//Selectors

export const selectOrigin = (state) => state.nav.origin;
export const selectDestination = (state) => state.nav.destination;
export const selectGoogleDirection = (state) => state.nav.googleDirection;

export default navSlice.reducer;
