# 🧪 Guía de Pruebas - Sistema de Prefix Personalizado

## 🎯 Objetivo
Esta guía te ayudará a probar el nuevo sistema de prefix personalizado de Dexbot.

## 🔧 Pasos para Probar

### 1. **Configuración Inicial**
```bash
# Paso 1: Configurar un prefix personalizado
/prefix set nuevo:!

# Paso 2: Verificar la configuración
/prefix view
```

### 2. **Pruebas Básicas**
```bash
# Comando de información básica
!ping

# Comando de ayuda
!help

# Información del bot
!botinfo
```

### 3. **Pruebas de Música** 🎵
```bash
# Reproducir por nombre (búsqueda directa completa)
!play bohemian rhapsody queen

# Reproducir por URL
!play https://www.youtube.com/watch?v=fJ9rUzIMcZQ

# Reproducir música en español
!play despacito luis fonsi

# Buscar música
!search imagine dragons

# Ver cola de reproducción
!queue view

# Controles básicos
!skip
!pause
!resume
!stop
```

**📝 Nota importante sobre música:**
- Con prefix personalizado, debes escribir el nombre COMPLETO de la canción
- No hay autocompletado, pero la búsqueda es más directa
- Puedes usar URLs completas de YouTube, Spotify, etc.
- El bot detecta automáticamente la fuente de la música

### 4. **Pruebas de Administración** (requiere permisos)
```bash
# Ver configuración del servidor
!serverinfo

# Sistema de bienvenida (si tienes permisos de admin)
!welcome toggle
```

### 5. **Pruebas de Diversión**
```bash
# Bola 8 mágica
!8ball ¿funcionará el sistema?

# Chiste aleatorio
!joke

# Lanzar moneda
!coinflip
```

### 6. **Pruebas de Validación**
```bash
# Intentar prefijos inválidos (deben fallar)
/prefix set nuevo:@!      # Contiene @
/prefix set nuevo:test me # Contiene espacio
/prefix set nuevo:/       # Prefix reservado

# Prefijos válidos
/prefix set nuevo:>>
/prefix set nuevo:?
/prefix set nuevo:~
```

### 7. **Pruebas de Funcionalidad Avanzada**
```bash
# Cambiar a prefix diferente
/prefix set nuevo:>>

# Probar comandos con el nuevo prefix
>>help
>>ping
>>play música favorita

# Restablecer al predeterminado
/prefix reset

# Verificar que ya no funciona el prefix personalizado
!ping    # No debería funcionar
/ping    # Debería funcionar normalmente
```

## ✅ Resultados Esperados

### **Configuración Exitosa**
- El comando `/prefix set` debe mostrar un embed verde de confirmación
- `/prefix view` debe mostrar tu prefix actual
- Los comandos con tu prefix deben ejecutarse normalmente

### **Validación de Errores**
- Prefijos inválidos deben mostrar mensajes de error claros
- Comandos inexistentes deben mostrar sugerencias útiles
- Errores de ejecución deben tener fallbacks informativos

### **Compatibilidad**
- Los slash commands (`/`) deben seguir funcionando normalmente
- El prefix personalizado debe funcionar en diferentes servidores
- La configuración debe persistir después de reiniciar el bot

## 🐛 Casos de Error a Probar

### **Comandos No Encontrados**
```bash
!comandoinexistente
# Debe mostrar mensaje de error con sugerencias
```

### **Comandos Sin Permisos**
```bash
!ban @usuario
# Si no tienes permisos, debe mostrar error apropiado
```

### **Comandos Complejos**
```bash
# Algunos comandos avanzados pueden no funcionar perfectamente
!welcome description
# Puede requerir usar /welcome description en su lugar
```

## 📊 Métricas de Éxito

- ✅ **Configuración**: Prefix se guarda correctamente en la base de datos
- ✅ **Ejecución**: Comandos responden como con slash commands
- ✅ **Persistencia**: Configuración se mantiene entre sesiones
- ✅ **Validación**: Errores son manejados apropiadamente
- ✅ **Compatibilidad**: Slash commands siguen funcionando

## 🚀 Siguiente Paso

Una vez completadas las pruebas exitosamente, el sistema estará listo para merge a la rama `main` y despliegue en producción.

---

**¡Happy Testing! 🎉**
