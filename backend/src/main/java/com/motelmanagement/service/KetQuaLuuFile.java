package com.motelmanagement.service;

public final class KetQuaLuuFile {

    private final String duongDan;
    private final String tenGoc;
    private final long kichThuoc;
    private final String loaiNoiDung;

    public KetQuaLuuFile(String duongDan, String tenGoc, long kichThuoc, String loaiNoiDung) {
        this.duongDan = duongDan;
        this.tenGoc = tenGoc;
        this.kichThuoc = kichThuoc;
        this.loaiNoiDung = loaiNoiDung;
    }

    public String duongDan() {
        return duongDan;
    }

    public String tenGoc() {
        return tenGoc;
    }

    public long kichThuoc() {
        return kichThuoc;
    }

    public String loaiNoiDung() {
        return loaiNoiDung;
    }
}
