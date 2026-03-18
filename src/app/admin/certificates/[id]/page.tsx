import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { documentStorage } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Vaccination Certificate" };
export const dynamic = "force-dynamic";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documentId = parseInt(id, 10);

  const [doc] = await db
    .select()
    .from(documentStorage)
    .where(eq(documentStorage.id, documentId));

  if (!doc || doc.documentType !== "vaccination_certificate") {
    notFound();
  }

  const cert = doc.metadata ? JSON.parse(doc.metadata) : null;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white">
      {/* Certificate Header */}
      <div className="text-center border-b-2 border-emerald-600 pb-6 mb-6">
        <div className="text-5xl mb-3">🐼</div>
        <h1 className="text-3xl font-bold text-emerald-700">{cert?.company?.name || "The Vaccine Panda"}</h1>
        <p className="text-gray-600 mt-1">Home Vaccination Services</p>
        <p className="text-gray-500 text-sm mt-1">GSTIN: {cert?.company?.gstin || "07AABCU9603R1ZM"}</p>
      </div>

      {/* Certificate Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
          Vaccination Certificate
        </h2>
        <p className="text-gray-500 mt-1">Certificate ID: {cert?.certificateId}</p>
      </div>

      {/* Patient Details */}
      <div className="bg-emerald-50 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">
          Patient Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-emerald-600">Patient Name</p>
            <p className="text-lg font-bold text-gray-900">{cert?.patientName}</p>
          </div>
          <div>
            <p className="text-sm text-emerald-600">Date of Vaccination</p>
            <p className="text-lg font-bold text-gray-900">
              {cert?.dateAdministered ? new Date(cert.dateAdministered).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }) : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Vaccination Details */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          Vaccination Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Vaccine Name</p>
            <p className="text-lg font-bold text-gray-900">{cert?.vaccineName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Brand</p>
            <p className="text-lg font-bold text-gray-900">{cert?.brand || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Batch Number</p>
            <p className="text-lg font-bold text-gray-900">{cert?.batchNumber || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Administered By</p>
            <p className="text-lg font-bold text-gray-900">{cert?.nurseName || "Authorized Medical Professional"}</p>
          </div>
        </div>
      </div>

      {/* Next Due Date */}
      {cert?.nextDueDate && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-800 mb-2">Next Vaccination Due</h3>
          <p className="text-xl font-bold text-blue-900">
            {new Date(cert.nextDueDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Notes */}
      {cert?.notes && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="text-gray-700">{cert.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <div className="grid grid-cols-2 gap-6 text-sm text-gray-500">
          <div>
            <p className="font-medium text-gray-700">Contact</p>
            <p>Phone: {cert?.company?.phone || "9999109040"}</p>
            <p>Email: {cert?.company?.email || "info@thevaccinepanda.com"}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-700">Issued On</p>
            <p>
              {cert?.issuedAt
                ? new Date(cert.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4 no-print">
        <button
          onClick={() => window.print()}
          className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Print Certificate
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
