'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Income extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Income.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Income.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    date: DataTypes.DATEONLY,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Income',
  });
  return Income;
};