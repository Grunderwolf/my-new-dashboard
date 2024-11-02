// app/context/SidebarContext.js
'use client';

import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [activePage, setActivePage] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <SidebarContext.Provider value={{
            activePage,
            setActivePage,
            isMobileMenuOpen,
            setIsMobileMenuOpen
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => useContext(SidebarContext);