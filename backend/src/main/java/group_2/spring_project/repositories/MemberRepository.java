package org.wldu.webservices.repositories;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.wldu.webservices.entities.Member;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // ========== BASIC QUERIES ==========

    Optional<Member> findByEmployeeId(String employeeId);
    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares WHERE m.workDomain = :workDomain")
    List<Member> findByWorkDomainWithShares(@Param("workDomain") Member.WorkDomain workDomain);
    
    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares WHERE m.workDomain = :workDomain")
    Page<Member> findByWorkDomainWithShares(@Param("workDomain") Member.WorkDomain workDomain, Pageable pageable);

    List<Member> findByWorkDomain(Member.WorkDomain workDomain);
    Page<Member> findByWorkDomain(Member.WorkDomain workDomain, Pageable pageable);
    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares WHERE m.isActive = :isActive")
    Page<Member> findByIsActiveWithShares(@Param("isActive") Boolean isActive, Pageable pageable);

    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares WHERE m.isActive = :isActive")
    List<Member> findByIsActiveWithShares(@Param("isActive") Boolean isActive);

    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares")
    List<Member> findAllWithShares();

    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares")
    Page<Member> findAllWithShares(Pageable pageable);

    List<Member> findByIsActive(Boolean isActive);
    Page<Member> findByIsActive(Boolean isActive, Pageable pageable);
    boolean existsByEmployeeId(String employeeId);

    // ========== CUSTOM QUERIES ==========

//    @Query("SELECT DISTINCT m FROM Member m " +
//            "LEFT JOIN FETCH m.shares " +
//            "LEFT JOIN FETCH m.savingAccounts " +
//            "WHERE m.id = :id")
//    Optional<Member> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares WHERE " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Member> searchWithShares(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT m FROM Member m LEFT JOIN FETCH m.shares WHERE " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Member> searchWithShares(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT m FROM Member m WHERE " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Member> search(@Param("keyword") String keyword);

    @Query("SELECT m FROM Member m WHERE " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.employeeId) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Member> search(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.isActive = true")
    Long countActiveMembers();

    @Query("SELECT m.workDomain, COUNT(m) FROM Member m " +
            "WHERE m.isActive = true " +
            "GROUP BY m.workDomain")
    List<Object[]> countActiveMembersByWorkDomain();

    @Query("SELECT DISTINCT m FROM Member m " +
            "LEFT JOIN FETCH m.shares " +
            "WHERE m.id = :id")
    Optional<Member> findByIdWithRelations(@Param("id") Long id);

}