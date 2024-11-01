// app/dashboard/page.js
import ProtectedRoute from '../components/ProtectedRoute';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            {/* Your dashboard content */}
        </ProtectedRoute>
    );
}