import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial

import mimetypes

mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")

ROOT = os.path.dirname(os.path.abspath(__file__))

class DevHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path.startswith('/src/') and '.' not in self.path.split('/')[-1]:
            candidate = self.path + '.js'
            if os.path.exists(os.path.join(ROOT, candidate.lstrip('/'))):
                self.path = candidate
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    with ThreadingHTTPServer(('127.0.0.1', port), DevHandler) as httpd:
        print(f'Serving {ROOT} on http://127.0.0.1:{port}')
        httpd.serve_forever()
