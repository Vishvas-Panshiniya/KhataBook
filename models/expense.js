'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Expense.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Expense.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    category: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Expense',
  });
  return Expense;
};