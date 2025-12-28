package group_2.spring_project.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "shares")
public class Share {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "share_value", nullable = false)
    private Double shareValue = 150.0;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "certificate_number", unique = true)
    private String certificateNumber;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnore
    private Member member;

    public Share() {
        this.purchaseDate = LocalDate.now();
    }

    public Share(String certificateNumber) {
        this();
        this.certificateNumber = certificateNumber;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getShareValue() { return shareValue; }
    public void setShareValue(Double shareValue) { this.shareValue = shareValue; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }
}