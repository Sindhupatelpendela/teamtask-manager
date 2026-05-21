import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Medium',
    validate: {
      isIn: [['Low', 'Medium', 'High']]
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Todo',
    validate: {
      isIn: [['Todo', 'In Progress', 'Completed']]
    }
  }
}, {
  timestamps: true
});

export default Task;
