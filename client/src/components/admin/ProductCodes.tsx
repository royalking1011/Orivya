import React, { useEffect, useMemo, useRef } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

export default function ProductCodes({
  sku,
  name,
}: {
  sku: string;
  name: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const safeSku = useMemo(() => sku || "", [sku]);

  useEffect(() => {
    if (!svgRef.current) return;
    if (!safeSku) return;

    JsBarcode(svgRef.current, safeSku, {
      format: "CODE128",
      displayValue: true,
      fontSize: 12,
      height: 60,
      margin: 10,
    });
  }, [safeSku]);

  useEffect(() => {
    if (!qrRef.current) return;
    if (!safeSku) return;

    QRCode.toCanvas(qrRef.current, safeSku, {
      width: 140,
      margin: 1,
    });
  }, [safeSku]);

  if (!safeSku) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border bg-white p-3 text-black">
        <div className="text-xs font-medium mb-2">{name}</div>
        <svg ref={svgRef} />
      </div>

      <div className="rounded-2xl border bg-white p-3 text-black flex flex-col items-center justify-center">
        <div className="text-xs font-medium mb-2">{name}</div>
        <canvas ref={qrRef} />
        <div className="mt-2 text-xs text-muted-foreground">{safeSku}</div>
      </div>
    </div>
  );
}
