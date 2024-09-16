import { useEffect, useState, useRef } from "react";
import api from "@/utilities/api";
import { useAuth } from "@/components/AuthProvider";
import PaymentRow from "./PaymentRow";
import { PaymentDetails } from "@/serializers/payments/payment-details-serializer";

const ActivePaymentTable = () => {
    const authContext = useAuth();
    const currentUser = authContext.user;
    const containerRef = useRef<HTMLDivElement>(null);

    const [payments, setPayments] = useState<PaymentDetails[]>([]);
    const [containerHeight, setContainerHeight] = useState<string>('400px'); // Default height

    useEffect(() => {
        const getPayments = async () => {
            try {
                const response = await api.fetch(`/api/payments/${currentUser.id}`, {
                    method: "GET",
                });
                const json = await response.json();
                setPayments(json.data);
            } catch (error) {
                console.error(`error: ${JSON.stringify(error)}`);
                alert(error);
            }
        };

        if (currentUser) getPayments();
    }, [currentUser]);

    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const height = window.innerHeight - 200; 
                setContainerHeight(`${height}px`);
            }
        };

        updateHeight();

        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const pendingPayments = payments.filter(payment => payment.state === 'pending');
    const groupedPayments = groupPaymentsByDate(pendingPayments);
    const sortedGroupedPayments = Object.keys(groupedPayments).map(date => {
        return {
            date,
            payments: sortPayments(groupedPayments[date])
        };
    });

    // Inline styles for the scrollable container
    const scrollableContainerStyle: React.CSSProperties = {
        width: 'flex-col',
        height: containerHeight, 
        overflowY: 'scroll',
        fontWeight: 600, 
        color: '#000000', 
        padding: '0.5rem', 
        marginTop: '1.25rem', 
        borderRadius: '0.375rem', 
    };

    

    return (
        <>
            <div className="text-xl font-bold text-gray-800 mt-4">Active Payments</div>
            <div ref={containerRef} style={scrollableContainerStyle}>
                {sortedGroupedPayments.length > 0 ? (
                    sortedGroupedPayments.map(({ date, payments }) => (
                        <div key={date} className="mb-4">
                            <div className="font-bold text-lg mb-2">{date}</div>
                            {payments.map((payment) => (
                                <PaymentRow key={payment.id} paymentDetails={payment} />
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-600">You have no active payments.</div>
                )}
            </div>
        </>
    );
};

export default ActivePaymentTable;


const groupPaymentsByDate = (payments: PaymentDetails[]): { [key: string]: PaymentDetails[] } => {
    return payments.reduce((groups, payments) => {
        const date = new Date(payments.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(payments);
        return groups;
    }, {});
};

const sortPayments = (payments: PaymentDetails[]): PaymentDetails[] => {
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};