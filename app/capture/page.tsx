import Link from 'next/link'
import { ArrowLeft, Camera, Image as ImageIcon, Scan } from 'lucide-react'

export default function CapturePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Log Food</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Camera Preview Placeholder */}
        <div className="bg-black rounded-lg mb-6 camera-viewfinder flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-300">Camera interface coming soon!</p>
            <p className="text-sm text-gray-400 mt-2">
              This will include real-time barcode detection
            </p>
          </div>
        </div>

        {/* Capture Options */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Scan className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Scan Barcode</h3>
                <p className="text-sm text-gray-600">
                  Automatically detect and scan product barcodes
                </p>
              </div>
              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                FREE
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Read Nutrition Label</h3>
                <p className="text-sm text-gray-600">
                  Scan nutrition facts labels with OCR
                </p>
              </div>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                ~$0.002
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Camera className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Analyze Food</h3>
                <p className="text-sm text-gray-600">
                  AI-powered analysis of fresh foods and meals
                </p>
              </div>
              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                ~$0.015
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Point camera at food item or barcode</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>System auto-detects barcodes in real-time</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Choose manual options if no barcode detected</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div>Review and confirm nutrition data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}