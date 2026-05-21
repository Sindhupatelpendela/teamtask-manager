import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Project Member',
    validate: {
      isIn: [['Project Admin', 'Project Member']]
    }
  }
}, {
  timestamps: true
});

export default ProjectMember;
