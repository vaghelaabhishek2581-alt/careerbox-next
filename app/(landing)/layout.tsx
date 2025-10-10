import WebLayout from "@/components/layouts/web-layout";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <WebLayout>{children}</WebLayout>
    </>
  );
};

export default layout;
