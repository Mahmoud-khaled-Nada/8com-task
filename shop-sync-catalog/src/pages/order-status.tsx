import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartAPI, orderAPI } from "@/lib/api";

type Props = {
  step: "confirmation" | "cancel";
};

export const OrderStatus: React.FC<Props> = ({ step }) => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const sessionId = query.get("session_id");

  const navigate = useNavigate();
  const [orderTotal, setOrderTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirm = async () => {
      if (step === "confirmation" && sessionId) {
        try {
          const res = await orderAPI.confirmOrder(sessionId);
          if (res.success) {
            setOrderTotal(res.data.totalAmount);
            await cartAPI.empty();
          }
        } catch (err: any) {
          setError(err?.response?.data?.message || "Failed to confirm order.");
        }
      }
    };

    confirm();
  }, [step, sessionId]);

  const handleClose = () => navigate("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          {step === "confirmation" && !error ? (
            <>
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">Order Confirmed!</CardTitle>
              <CardDescription>
                Order confirmed successfully! Thank you for your purchase. Your order is being processed.
                <br />
              </CardDescription>
            </>
          ) : step === "cancel" ? (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">Order Cancelled</CardTitle>
              <CardDescription>
                The checkout session was canceled. Please try again or continue browsing.
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "confirmation" && !error && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <p className="text-emerald-800 font-medium">
                Order Total: ${orderTotal !== null ? orderTotal.toFixed(2) : "Loading..."}
              </p>
            </div>
          )}

          <Button
            onClick={handleClose}
            className={
              step === "confirmation"
                ? "w-full bg-emerald-600 hover:bg-emerald-700"
                : step === "cancel"
                ? "w-full bg-gray-600 hover:bg-gray-700"
                : "w-full bg-red-600 hover:bg-red-700"
            }
          >
            {step === "confirmation"
              ? "Continue Shopping"
              : step === "cancel"
              ? "Return to Shop"
              : "Try Again"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
