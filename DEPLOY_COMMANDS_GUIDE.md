# 🚀 Guía de Deploy Automático de Comandos

## 🎯 **Problema Resuelto**
Los comandos slash no aparecían después del deploy porque Discord requiere registro explícito de comandos.

## ⚙️ **Solución Implementada**

### **1. Auto-Deploy en Producción**
- El bot ahora registra automáticamente todos los comandos slash cuando se inicia
- Solo se activa en producción o cuando `AUTO_DEPLOY_COMMANDS=true`

### **2. Configuración en Render**

**Variables de Entorno a agregar:**
```
AUTO_DEPLOY_COMMANDS=true
NODE_ENV=production
```

**O simplemente:**
```
AUTO_DEPLOY_COMMANDS=true
```

### **3. Logs Mejorados**
Al iniciar, verás logs como:
```
🤖 Bot Dexbot#1234 is now online!
🔄 Auto-deploying slash commands...
✅ Loaded command: help
✅ Loaded command: play
✅ Loaded command: prefix
🔄 Started refreshing 25 application (/) commands.
✅ Successfully reloaded 25 application (/) commands.

📋 Registered commands:
  1. /help - Muestra ayuda del bot
  2. /play - Reproducir música
  3. /prefix - Establece un prefix personalizado
  ...
```

## 🔧 **Archivos Modificados**

1. **`lanya.js`**: Auto-deploy en evento `ready`
2. **`handlers/deployCommands.js`**: Manejo de errores mejorado
3. **`.env`**: Variable `AUTO_DEPLOY_COMMANDS=true`

## ⏱️ **Tiempo de Propagación**

- **Comandos Globales**: 1-2 horas máximo
- **En desarrollo**: Inmediato para testing

## 🧪 **Testing Local**

```bash
# Activar auto-deploy localmente
AUTO_DEPLOY_COMMANDS=true npm start

# O establecer en .env
echo "AUTO_DEPLOY_COMMANDS=true" >> .env
```

## 🎉 **Resultado**

Después del próximo deploy en Render:
1. El bot se conectará
2. Automáticamente registrará todos los comandos
3. El comando `/prefix` aparecerá disponible
4. Todos los comandos nuevos se registrarán automáticamente

---

**¡No más comandos perdidos en deploy! 🚀**
