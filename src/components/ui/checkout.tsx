"use client";

import React, { useEffect, useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/router";

const Checkout: React.FC = () => {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
  
    const timer1 = setTimeout(() => {
      setShowSuccess(true);
    }, 2000);


    const timer2 = setTimeout(() => {
      router.push("/");
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        color: "white",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}
        >
          {showSuccess ? (
            <>
              <CheckCircleIcon
                sx={{
                  fontSize: { xs: 60, sm: 90 },
                  color: "#22c55e",
                  mb: 2,
                }}
              />
              <Typography
                variant="h4"
                fontWeight={800}
                color="black"
                gutterBottom
              >
                Order Received! 🎉
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Thank you for your purchase.  
                Redirecting you to the menu...
              </Typography>
            </>
          ) : (
            <Typography
              variant="h5"
              fontWeight={700}
              color="black"
              gutterBottom
            >
              Processing your order...
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Checkout;
