package org.wldu.webservices.services;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wldu.webservices.entities.Member;
import org.wldu.webservices.entities.Share;
import org.wldu.webservices.repositories.MemberRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;


    // ========== CREATE OPERATIONS ==========

    @Transactional
    public Member registerMember(Member member) {
        System.out.println("DEBUG: Registering member: " + member.getEmployeeId());
        
        if (memberRepository.existsByEmployeeId(member.getEmployeeId())) {
            throw new IllegalArgumentException("Employee ID already exists: " + member.getEmployeeId());
        }

        member.setRegistrationFee(500.0);

        createInitialShares(member);

        Member savedMember = memberRepository.save(member);
        System.out.println("DEBUG: Saved member with " + savedMember.getShares().size() + " shares");
        
        return savedMember;
    }

    // ========== READ OPERATIONS ==========

    @Transactional(readOnly = true)
    public Member getMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Member> getAllActiveMembers() {
        return memberRepository.findByIsActiveWithShares(true);
    }

    @Transactional(readOnly = true)
    public Page<Member> getAllActiveMembers(Pageable pageable) {
        return memberRepository.findByIsActiveWithShares(true, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Member> getAllMembers(Pageable pageable) {
        return memberRepository.findAllWithShares(pageable);
    }

    @Transactional(readOnly = true)
    public List<Member> getAllMembers() {
        return memberRepository.findAllWithShares();
    }

    @Transactional(readOnly = true)
    public Member getMemberWithRelations(Long id) {
        return memberRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Member> searchMembers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllActiveMembers();
        }
        return memberRepository.searchWithShares(keyword.trim());
    }

    @Transactional(readOnly = true)
    public Page<Member> searchMembers(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllMembers(pageable);
        }
        return memberRepository.searchWithShares(keyword.trim(), pageable);
    }

    @Transactional(readOnly = true)
    public List<Member> getMembersByDomain(Member.WorkDomain domain) {
        return memberRepository.findByWorkDomainWithShares(domain);
    }

    @Transactional(readOnly = true)
    public Page<Member> getMembersByDomain(Member.WorkDomain domain, Pageable pageable) {
        return memberRepository.findByWorkDomainWithShares(domain, pageable);
    }

    // ========== UPDATE OPERATIONS ==========

    @Transactional
    public Member updateMember(Long id, Member updatedData) {
        Member existingMember = getMember(id);

        // Update allowed fields
        if (updatedData.getFirstName() != null) {
            existingMember.setFirstName(updatedData.getFirstName());
        }
        if (updatedData.getLastName() != null) {
            existingMember.setLastName(updatedData.getLastName());
        }
        if (updatedData.getEmail() != null) {
            existingMember.setEmail(updatedData.getEmail());
        }
        if (updatedData.getPhoneNumber() != null) {
            existingMember.setPhoneNumber(updatedData.getPhoneNumber());
        }

        return memberRepository.save(existingMember);
    }

    @Transactional
    public Member deactivateMember(Long id, String reason) {
        Member member = getMember(id);

        member.setIsActive(false);
        member.setDeactivationDate(LocalDate.now());
        member.setDeactivationReason(reason != null ? reason : "Member request");

        return memberRepository.save(member);
    }

    @Transactional
    public Member reactivateMember(Long id) {
        Member member = getMember(id);

        // Must have minimum 3 shares to reactivate
        if (member.getShares().size() < 3) {
            throw new IllegalArgumentException("Cannot reactivate. Need minimum 3 shares.");
        }

        member.setIsActive(true);
        member.setDeactivationDate(null);
        member.setDeactivationReason(null);

        return memberRepository.save(member);
    }

    // ========== BUSINESS OPERATIONS ==========

    @Transactional(readOnly = true)
    public boolean checkEligibility(Long memberId) {
        Member member = getMemberWithRelations(memberId);
        return member.getIsActive() && member.getShares().size() >= 3;
    }

    @Transactional
    public Member purchaseAdditionalShares(Long memberId, int numberOfShares) {
        System.out.println("DEBUG: Starting share purchase for member " + memberId);

        try {
            // Get member WITH shares (use findById, not findByIdWithRelations)
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + memberId));

            System.out.println("DEBUG: Member found: " + member.getFirstName());

            // Validate purchase
            validateSharePurchase(member, numberOfShares);

            // Create new shares - IMPORTANT: set both sides of relationship
            int startNumber = member.getShares().size() + 1;
            for (int i = 0; i < numberOfShares; i++) {
                Share share = new Share();
                share.setCertificateNumber(
                        "SH-" + member.getEmployeeId() + "-" +
                                String.format("%03d", startNumber + i)
                );
                share.setMember(member);  // Set member reference
                member.getShares().add(share);  // Add to member's list
                System.out.println("DEBUG: Created share: " + share.getCertificateNumber());
            }

            // Save member (shares should cascade)
            Member saved = memberRepository.save(member);
            System.out.println("DEBUG: Saved member with " + saved.getShares().size() + " shares");

            return saved;

        } catch (Exception e) {
            System.err.println("ERROR in purchaseAdditionalShares: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public double getTotalShareValue(Long memberId) {
        Member member = getMemberWithRelations(memberId);
        return member.getShares().stream()
                .mapToDouble(Share::getShareValue)
                .sum();
    }

    // ========== STATISTICS ==========

    @Transactional(readOnly = true)
    public Long getActiveMemberCount() {
        return memberRepository.countActiveMembers();
    }

    // ========== HELPER METHODS ==========

    private void createInitialShares(Member member) {
        System.out.println("DEBUG: Creating initial shares for member: " + member.getEmployeeId());
        for (int i = 1; i <= 3; i++) {
            Share share = new Share();
            share.setCertificateNumber(
                    "SH-" + member.getEmployeeId() + "-" +
                            String.format("%03d", i)
            );
            share.setMember(member);
            member.getShares().add(share);
            System.out.println("DEBUG: Created share: " + share.getCertificateNumber());
        }
        System.out.println("DEBUG: Total shares in member: " + member.getShares().size());
    }

    private void validateSharePurchase(Member member, int numberOfShares) {
        if (!member.getIsActive()) {
            throw new IllegalArgumentException("Inactive members cannot purchase shares");
        }

        if (numberOfShares < 1) {
            throw new IllegalArgumentException("Minimum 1 share per purchase");
        }

        if (numberOfShares > 10) {
            throw new IllegalArgumentException("Maximum 10 shares per transaction");
        }

        int currentShares = member.getShares().size();
        if (currentShares + numberOfShares > 100) {
            throw new IllegalArgumentException(
                    "Maximum 100 shares per member. You have " + currentShares + " shares"
            );
        }
    }
}
