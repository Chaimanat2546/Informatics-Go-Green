'use client';

import { Suspense } from 'react';
import HomePage from '@/components/wasteTracking/HomePage';

//wait fetch user

export default function DashboardPage() {
    
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePage  />
        </Suspense>
    );
}
