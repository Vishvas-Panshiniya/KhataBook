'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Loan.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Loan.hasMany(models.EMI, { foreignKey: 'loanId', as: 'emis', onDelete: 'CASCADE' });
    }
  }
  Loan.init({
    userId: DataTypes.INTEGER,
    loanName: DataTypes.STRING,
    loanType: DataTypes.STRING,
    principalAmount: DataTypes.DECIMAL,
    interestAmount: DataTypes.DECIMAL,
    totalAmount: DataTypes.DECIMAL,
    remainingAmount: DataTypes.DECIMAL,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Loan',
  });
  return Loan;
};