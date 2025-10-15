@echo off
echo Iniciando Cloudflare Worker...
echo.
npx wrangler dev --persist-to .wrangler\state --port 8787
pause

