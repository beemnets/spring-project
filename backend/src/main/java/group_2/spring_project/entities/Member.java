package group_2.spring_project.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "members", indexes = {
        @Index(name = "idx_member_employee_id", columnList = "employee_id"),
        @Index(name = "idx_member_work_domain", columnList = "work_domain"),
        @Index(name = "idx_member_active", columnList = "is_active")
})
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "employee_id", unique = true, nullable = false, length = 50)
    private String employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_domain", nullable = false, length = 20)
    private WorkDomain workDomain;

    @Column(length = 100)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "registration_date", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "registration_fee", nullable = false)
    private Double registrationFee = 500.0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "deactivation_date")
    private LocalDate deactivationDate;

    @Column(name = "deactivation_reason", length = 255)
    private String deactivationReason;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Share> shares = new ArrayList<>();

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SavingAccount> savingAccounts = new ArrayList<>();

    public Member() {
        this.registrationDate = LocalDate.now();
    }

    public Member(String firstName, String lastName, String employeeId, WorkDomain workDomain) {
        this();
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeId = employeeId;
        this.workDomain = workDomain;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public WorkDomain getWorkDomain() { return workDomain; }
    public void setWorkDomain(WorkDomain workDomain) { this.workDomain = workDomain; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDate getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDate registrationDate) { this.registrationDate = registrationDate; }

    public Double getRegistrationFee() { return registrationFee; }
    public void setRegistrationFee(Double registrationFee) { this.registrationFee = registrationFee; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDate getDeactivationDate() { return deactivationDate; }
    public void setDeactivationDate(LocalDate deactivationDate) { this.deactivationDate = deactivationDate; }

    public String getDeactivationReason() { return deactivationReason; }
    public void setDeactivationReason(String deactivationReason) { this.deactivationReason = deactivationReason; }

    public List<Share> getShares() { return shares; }
    public void setShares(List<Share> shares) { this.shares = shares; }

    public List<SavingAccount> getSavingAccounts() { return savingAccounts; }
    public void setSavingAccounts(List<SavingAccount> savingAccounts) {
        this.savingAccounts = savingAccounts;
    }

    public enum WorkDomain {
        ACADEMIC,
        ADMINISTRATION,
        CONTRACT,
        OTHER
    }
}