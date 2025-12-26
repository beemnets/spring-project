package group_2.spring_project.entities;


import jakarta.persistence.*;

@Entity
@DiscriminatorValue("INFORMAL")
public class InformalSavingAccount extends SavingAccount {

    @Column(name = "target_amount")
    private Double targetAmount;

    @Column(name = "daily_withdrawal_limit")
    private Double dailyWithdrawalLimit = 10000.0; // Default 10,000 ETB

    @Column(name = "minimum_balance")
    private Double minimumBalance = 0.0;


    public InformalSavingAccount() {
        super();
    }

    public InformalSavingAccount(Double targetAmount) {
        this();
        this.targetAmount = targetAmount;
    }


    public Double getTargetAmount() { return targetAmount; }
    public void setTargetAmount(Double targetAmount) { this.targetAmount = targetAmount; }

    public Double getDailyWithdrawalLimit() { return dailyWithdrawalLimit; }
    public void setDailyWithdrawalLimit(Double dailyWithdrawalLimit) {
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
    }

    public Double getMinimumBalance() { return minimumBalance; }
    public void setMinimumBalance(Double minimumBalance) { this.minimumBalance = minimumBalance; }
}