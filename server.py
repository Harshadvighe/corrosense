#!/usr/bin/env python3
"""
Simple HTTP Server for CorroSense Dashboard
Run: python server.py
Then open: http://localhost:8000
"""

import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
})

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🚀 CorroSense Dashboard running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()
