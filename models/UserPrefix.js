const mongoose = require('mongoose');

const userPrefixSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  prefix: { 
    type: String, 
    required: true, 
    default: '/',
    maxlength: 3, // Límite de longitud para evitar spam
    validate: {
      validator: function(v) {
        // Validar que no contenga espacios o caracteres especiales problemáticos
        return !/\s/.test(v) && !/[@#`]/.test(v);
      },
      message: 'El prefix no puede contener espacios o caracteres especiales como @, #, `'
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware para actualizar updatedAt en cada save
userPrefixSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserPrefix = mongoose.model('UserPrefix', userPrefixSchema);

module.exports = UserPrefix;
