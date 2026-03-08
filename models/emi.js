'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EMI extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EMI.belongsTo(models.Loan, { foreignKey: 'loanId', as: 'loan' });
    }
  }
  EMI.init({
    loanId: DataTypes.INTEGER,
    emiAmount: DataTypes.DECIMAL,
    interestAmount: DataTypes.DECIMAL,
    paymentDate: DataTypes.DATEONLY,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'EMI',
  });
  return EMI;
};