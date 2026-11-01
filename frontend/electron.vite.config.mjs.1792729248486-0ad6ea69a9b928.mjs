import "node:module";
import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// electron.vite.config.mjs
var electron_vite_config_default = defineConfig({
	main: {},
	preload: {},
	renderer: {
		resolve: { alias: {
			"@": resolve("src/renderer/src"),
			"@renderer": resolve("src/renderer/src")
		} },
		plugins: [react(), tailwindcss()]
	}
});
export { electron_vite_config_default as default };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlY3Ryb24udml0ZS5jb25maWcuanMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiQzovVXNlcnMvSFAvRGVza3RvcC9wcm9qZWN0cy9DQVRfREVTS19BRE1JTl9FTEVDVFJPTi9mcm9udGVuZC9lbGVjdHJvbi52aXRlLmNvbmZpZy5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICdlbGVjdHJvbi12aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBtYWluOiB7fSxcbiAgcHJlbG9hZDoge30sXG4gIHJlbmRlcmVyOiB7XG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiByZXNvbHZlKCdzcmMvcmVuZGVyZXIvc3JjJyksXG4gICAgICAgICdAcmVuZGVyZXInOiByZXNvbHZlKCdzcmMvcmVuZGVyZXIvc3JjJylcbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXVxuICB9XG59KVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFLQSxJQUFBLCtCQUFlLGFBQWE7Q0FDMUIsTUFBTSxDQUFDO0NBQ1AsU0FBUyxDQUFDO0NBQ1YsVUFBVTtFQUNSLFNBQVMsRUFDUCxPQUFPO0dBQ0wsS0FBSyxRQUFRLGtCQUFrQjtHQUMvQixhQUFhLFFBQVEsa0JBQWtCO0VBQ3pDLEVBQ0Y7RUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztDQUNsQztBQUNGLENBQUMifQ==