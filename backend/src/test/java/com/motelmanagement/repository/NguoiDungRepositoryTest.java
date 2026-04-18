package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = Replace.NONE)
class NguoiDungRepositoryTest {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Test
    void luuVaTimTheoTenDangNhap() {
        NguoiDung nd = new NguoiDung();
        nd.setTenDangNhap("ut_user_1");
        nd.setMatKhau("encoded");
        nd.setHoTen("UT");
        nd.setVaiTro(VaiTro.TENANT);
        nd.setKichHoat(true);
        nguoiDungRepository.save(nd);

        assertTrue(nguoiDungRepository.findByTenDangNhap("ut_user_1").isPresent());
        assertEquals("UT", nguoiDungRepository.findByTenDangNhap("ut_user_1").get().getHoTen());
    }
}
