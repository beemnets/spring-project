package group_2.spring_project.entities;


import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@DiscriminatorValue("FORMAL")
public class FormalSavingAccount extends SavingAccount {

    @NotNull
    @Min(value = 100, message = "Minimum monthly amount is 100 ETB")
    @Column(name = "monthly_amount", nullable = false)
    private Double monthlyAmount;

    @Column(name = "last_monthly_deposit_date")
    private LocalDate lastMonthlyDepositDate;

    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    @Column(name = "interest_rate")
    private Double interestRate = 7.0;


    public FormalSavingAccount() {
        super();
    }

    public FormalSavingAccount(Double monthlyAmount) {
        this();
        this.monthlyAmount = monthlyAmount;
    }


    public Double getMonthlyAmount() { return monthlyAmount; }
    public void setMonthlyAmount(Double monthlyAmount) { this.monthlyAmount = monthlyAmount; }

    public LocalDate getLastMonthlyDepositDate() { return lastMonthlyDepositDate; }
    public void setLastMonthlyDepositDate(LocalDate lastMonthlyDepositDate) {
        this.lastMonthlyDepositDate = lastMonthlyDepositDate;
    }

    public LocalDate getMaturityDate() { return maturityDate; }
    public void setMaturityDate(LocalDate maturityDate) { this.maturityDate = maturityDate; }

    public Double getInterestRate() { return interestRate; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }
}