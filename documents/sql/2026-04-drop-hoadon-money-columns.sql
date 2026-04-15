-- Bo 4 cot tien khoi bang hoa_don (BE da tinh dong runtime).
ALTER TABLE hoa_don
    DROP COLUMN tien_phong,
    DROP COLUMN tien_dien,
    DROP COLUMN tien_nuoc,
    DROP COLUMN tong_tien;

