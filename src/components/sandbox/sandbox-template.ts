export function getSandboxHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.26.2/babel.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #07080d;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      overflow-x: hidden;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.14); border-radius: 9999px; }
  </style>
</head>
<body>
  <div id="compile-badge" style="display:none; position:fixed; bottom:10px; right:10px; z-index:9999; padding:5px 10px; border-radius:999px; font-size:11px; font-family:monospace; background:rgba(245, 158, 11, 0.16); color:#fbbf24; border:1px solid rgba(245, 158, 11, 0.35); backdrop-filter:blur(8px);">
    ⚡ Buffering JSX Stream...
  </div>
  <div id="root"></div>

  <script>
    (function() {
      const rootElement = document.getElementById('root');
      const badgeElement = document.getElementById('compile-badge');
      let reactRoot = ReactDOM.createRoot(rootElement);

      class SandboxErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, message: '' };
        }
        static getDerivedStateFromError(error) {
          return { hasError: true, message: error && error.message ? error.message : String(error) };
        }
        componentDidUpdate(prevProps) {
          if (prevProps.codeVersion !== this.props.codeVersion && this.state.hasError) {
            this.setState({ hasError: false, message: '' });
          }
        }
        render() {
          if (this.state.hasError) {
            return React.createElement(
              'div',
              { className: 'm-4 p-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-200 text-xs font-mono' },
              React.createElement('div', { className: 'font-semibold text-rose-400 mb-1' }, 'Runtime Execution Notice'),
              React.createElement('div', { className: 'opacity-80 break-all' }, this.state.message)
            );
          }
          return this.props.children;
        }
      }

      const IconProxy = new Proxy({}, {
        get: function(_, iconName) {
          return function IconComponent(props) {
            const size = (props && props.size) || 16;
            const className = (props && props.className) || 'w-4 h-4';
            return React.createElement(
              'svg',
              {
                width: size,
                height: size,
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                className: className
              },
              React.createElement('circle', { cx: 12, cy: 12, r: 9, strokeOpacity: 0.45 }),
              React.createElement('path', { d: 'M12 8v4l2.5 2.5' })
            );
          };
        }
      });

      function sanitizeCode(raw) {
        if (!raw) return '';
        let cleaned = raw
          .replace(/^\\s*\\x60{3}(?:jsx|tsx|javascript|typescript|js|ts)?\\s*/i, '')
          .replace(/\\x60{3}\\s*$/i, '')
          .trim();

        cleaned = cleaned
          .replace(/^\\s*import\\s+[\\s\\S]*?from\\s+['"][^'"]+['"];?\\s*$/gm, '')
          .replace(/export\\s+default\\s+function\\s+App/g, 'function App')
          .replace(/export\\s+function\\s+App/g, 'function App')
          .replace(/export\\s+default\\s+App;?/g, '');

        return cleaned;
      }

      let renderCount = 0;

      window.addEventListener('message', function(event) {
        const payload = event.data;
        if (!payload || payload.type !== 'COMPILE_CODE') return;

        const cleaned = sanitizeCode(payload.code);
        if (!cleaned) return;

        try {
          const transpiled = Babel.transform(cleaned, {
            presets: ['react', 'env'],
            filename: 'dynamic-component.jsx'
          }).code;

          const factory = new Function(
            'React',
            'useState',
            'useEffect',
            'useMemo',
            'useCallback',
            'useRef',
            'Lucide',
            transpiled + '\\n; return typeof App !== "undefined" ? App : null;'
          );

          const AppComponent = factory(
            React,
            React.useState,
            React.useEffect,
            React.useMemo,
            React.useCallback,
            React.useRef,
            IconProxy
          );

          if (!AppComponent) {
            throw new Error('Component must define function App() { ... }');
          }

          renderCount += 1;
          badgeElement.style.display = 'none';

          reactRoot.render(
            React.createElement(
              SandboxErrorBoundary,
              { codeVersion: renderCount },
              React.createElement(AppComponent)
            )
          );

          setTimeout(function() {
            window.parent.postMessage({
              type: 'COMPILE_SUCCESS',
              height: document.body.scrollHeight
            }, '*');
          }, 30);
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          badgeElement.style.display = 'block';
          badgeElement.textContent = payload.isStreaming
            ? '⚡ Streaming JSX AST...'
            : '⚠ Syntax Notice: ' + message.slice(0, 48);

          window.parent.postMessage({
            type: 'COMPILE_ERROR',
            error: message
          }, '*');
        }
      });

      window.parent.postMessage({ type: 'SANDBOX_READY' }, '*');
    })();
  </script>
</body>
</html>`;
}