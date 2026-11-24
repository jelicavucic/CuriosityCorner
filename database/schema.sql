-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema curiosity_corner
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema curiosity_corner
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `curiosity_corner` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `curiosity_corner` ;

-- -----------------------------------------------------
-- Table `curiosity_corner`.`administrator`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`administrator` (
  `IdAdministratora` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `KorisnickoIme` VARCHAR(100) NOT NULL,
  `Ime` VARCHAR(150) NOT NULL,
  `Email` VARCHAR(254) NOT NULL,
  `LozinkaHash` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`IdAdministratora`),
  UNIQUE INDEX `UQ_ADMINISTRATOR_KORISNICKO_IME` (`KorisnickoIme` ASC) VISIBLE,
  UNIQUE INDEX `UQ_ADMINISTRATOR_EMAIL` (`Email` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`kategorija`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`kategorija` (
  `IdKategorije` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdNadkategorije` BIGINT UNSIGNED NULL DEFAULT NULL,
  `Naziv` VARCHAR(150) NOT NULL,
  `Opis` VARCHAR(1000) NULL DEFAULT NULL,
  PRIMARY KEY (`IdKategorije`),
  UNIQUE INDEX `UQ_KATEGORIJA_NADKATEGORIJA_NAZIV` (`IdNadkategorije` ASC, `Naziv` ASC) VISIBLE,
  CONSTRAINT `FK_KATEGORIJA_NADKATEGORIJA`
    FOREIGN KEY (`IdNadkategorije`)
    REFERENCES `curiosity_corner`.`kategorija` (`IdKategorije`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`igrica`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`igrica` (
  `IdIgrice` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdKategorije` BIGINT UNSIGNED NOT NULL,
  `Naziv` VARCHAR(200) NOT NULL,
  `Opis` VARCHAR(2000) NULL DEFAULT NULL,
  `Status` VARCHAR(30) NOT NULL,
  `MinimalniUzrast` INT UNSIGNED NOT NULL,
  `MaksimalniUzrast` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`IdIgrice`),
  UNIQUE INDEX `UQ_IGRICA_KATEGORIJA_NAZIV` (`IdKategorije` ASC, `Naziv` ASC) VISIBLE,
  CONSTRAINT `FK_IGRICA_KATEGORIJA`
    FOREIGN KEY (`IdKategorije`)
    REFERENCES `curiosity_corner`.`kategorija` (`IdKategorije`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`nivo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`nivo` (
  `IdNivoa` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdIgrice` BIGINT UNSIGNED NOT NULL,
  `RedniBroj` INT UNSIGNED NOT NULL,
  `Naziv` VARCHAR(150) NOT NULL,
  `BodoviZaOtkljucavanje` INT UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`IdNivoa`),
  UNIQUE INDEX `UQ_NIVO_IGRICA_REDNI_BROJ` (`IdIgrice` ASC, `RedniBroj` ASC) VISIBLE,
  UNIQUE INDEX `UQ_NIVO_IGRICA_ID_NIVOA` (`IdIgrice` ASC, `IdNivoa` ASC) VISIBLE,
  CONSTRAINT `FK_NIVO_IGRICA`
    FOREIGN KEY (`IdIgrice`)
    REFERENCES `curiosity_corner`.`igrica` (`IdIgrice`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`tip_aktivnosti`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`tip_aktivnosti` (
  `IdTipa` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Oznaka` VARCHAR(50) NOT NULL,
  `Naziv` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`IdTipa`),
  UNIQUE INDEX `UQ_TIP_AKTIVNOSTI_OZNAKA` (`Oznaka` ASC) VISIBLE,
  UNIQUE INDEX `UQ_TIP_AKTIVNOSTI_NAZIV` (`Naziv` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`aktivnost`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`aktivnost` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdNivoa` BIGINT UNSIGNED NOT NULL,
  `IdTipa` BIGINT UNSIGNED NOT NULL,
  `RedniBroj` INT UNSIGNED NOT NULL,
  `Uputstvo` VARCHAR(1000) NULL DEFAULT NULL,
  `Tezina` ENUM('LAKO', 'SREDNJE', 'TESKO') NOT NULL,
  `BrojBodova` INT UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`IdAktivnosti`),
  UNIQUE INDEX `UQ_AKTIVNOST_NIVO_REDNI_BROJ` (`IdNivoa` ASC, `RedniBroj` ASC) VISIBLE,
  UNIQUE INDEX `UQ_AKTIVNOST_NIVO_ID_AKTIVNOSTI` (`IdNivoa` ASC, `IdAktivnosti` ASC) VISIBLE,
  INDEX `FK_AKTIVNOST_TIP` (`IdTipa` ASC) VISIBLE,
  CONSTRAINT `FK_AKTIVNOST_NIVO`
    FOREIGN KEY (`IdNivoa`)
    REFERENCES `curiosity_corner`.`nivo` (`IdNivoa`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_AKTIVNOST_TIP`
    FOREIGN KEY (`IdTipa`)
    REFERENCES `curiosity_corner`.`tip_aktivnosti` (`IdTipa`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`bajka`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`bajka` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `Naslov` VARCHAR(250) NOT NULL,
  `Tekst` TEXT NOT NULL,
  `PutanjaAudioZapisa` VARCHAR(500) NULL DEFAULT NULL,
  `PutanjaNaslovneSlike` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`IdAktivnosti`),
  CONSTRAINT `FK_BAJKA_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`razvrstavanje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`razvrstavanje` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`IdAktivnosti`),
  CONSTRAINT `FK_RAZVRSTAVANJE_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`grupa_razvrstavanja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`grupa_razvrstavanja` (
  `IdGrupe` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `Naziv` VARCHAR(150) NOT NULL,
  `IdSadrzaja` INT NULL,
  PRIMARY KEY (`IdGrupe`),
  UNIQUE INDEX `UQ_GRUPA_RAZVRSTAVANJA_AKTIVNOST_NAZIV` (`IdAktivnosti` ASC, `Naziv` ASC) VISIBLE,
  UNIQUE INDEX `UQ_GRUPA_RAZVRSTAVANJA_AKTIVNOST_ID_GRUPE` (`IdAktivnosti` ASC, `IdGrupe` ASC) VISIBLE,
  CONSTRAINT `FK_GRUPA_RAZVRSTAVANJA_SADRZAJ`
    FOREIGN KEY (`IdSadrzaja`)
    REFERENCES `curiosity_corner`.`sadrzaj` (`idSadrzaja`),
  CONSTRAINT `FK_GRUPA_RAZVRSTAVANJA_RAZVRSTAVANJE`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`razvrstavanje` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`korisnik`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`korisnik` (
  `idKorisnika` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `KorisnickoIme` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `LozinkaHash` VARCHAR(255) NOT NULL,
  `Ime` VARCHAR(150) NOT NULL,
  `DatumKreiranja` DATETIME(3) NOT NULL,
  PRIMARY KEY (`idKorisnika`),
  UNIQUE INDEX `KorisnickoIme_UNIQUE` (`KorisnickoIme` ASC) VISIBLE,
  UNIQUE INDEX `Email_UNIQUE` (`Email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`igrac`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`avatar` (
  `idAvatara` INT NOT NULL AUTO_INCREMENT,
  `Naziv` VARCHAR(255) NOT NULL,
  `PutanjaSlike` VARCHAR(255) NOT NULL,
  `Aktivan` BOOLEAN NOT NULL,
  PRIMARY KEY (`idAvatara`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `curiosity_corner`.`igrac` (
  `IdIgraca` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Ime` VARCHAR(150) NOT NULL,
  `DatumRodjenja` DATE NOT NULL,
  `korisnik_idKorisnika` INT UNSIGNED NOT NULL,
  `idAvatara` INT NULL DEFAULT NULL,
  PRIMARY KEY (`IdIgraca`),
  INDEX `fk_igrac_korisnik1_idx` (`korisnik_idKorisnika` ASC) VISIBLE,
  INDEX `fk_igrac_avatar1_idx` (`idAvatara` ASC) VISIBLE,
  CONSTRAINT `fk_igrac_korisnik1`
    FOREIGN KEY (`korisnik_idKorisnika`)
    REFERENCES `curiosity_corner`.`korisnik` (`idKorisnika`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_igrac_avatar1`
    FOREIGN KEY (`idAvatara`)
    REFERENCES `curiosity_corner`.`avatar` (`idAvatara`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`spajanje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`spajanje` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `NasumicanRaspored` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`IdAktivnosti`),
  CONSTRAINT `FK_SPAJANJE_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`sadrzaj`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`sadrzaj` (
  `idSadrzaja` INT NOT NULL AUTO_INCREMENT,
  `Tekst` TEXT NULL,
  `PutanjaSlike` VARCHAR(500) NULL,
  `AlternativniTekst` VARCHAR(250) NULL,
  PRIMARY KEY (`idSadrzaja`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`par_za_spajanje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`par_za_spajanje` (
  `IdPara` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `RedniBroj` INT UNSIGNED NOT NULL,
  `idLijevogSadrzaja` INT NOT NULL,
  `idDesnogSadrzaja` INT NOT NULL,
  PRIMARY KEY (`IdPara`),
  UNIQUE INDEX `UQ_PAR_ZA_SPAJANJE_REDNI_BROJ` (`IdAktivnosti` ASC, `RedniBroj` ASC) VISIBLE,
  INDEX `fk_par_za_spajanje_sadrzaj1_idx` (`idLijevogSadrzaja` ASC) VISIBLE,
  INDEX `fk_par_za_spajanje_sadrzaj2_idx` (`idDesnogSadrzaja` ASC) VISIBLE,
  CONSTRAINT `FK_PAR_ZA_SPAJANJE_SPAJANJE`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`spajanje` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_par_za_spajanje_sadrzaj1`
    FOREIGN KEY (`idLijevogSadrzaja`)
    REFERENCES `curiosity_corner`.`sadrzaj` (`idSadrzaja`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_par_za_spajanje_sadrzaj2`
    FOREIGN KEY (`idDesnogSadrzaja`)
    REFERENCES `curiosity_corner`.`sadrzaj` (`idSadrzaja`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`pokusaj_igre`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`pokusaj_igre` (
  `IdPokusajaIgre` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdIgraca` BIGINT UNSIGNED NOT NULL,
  `IdIgrice` BIGINT UNSIGNED NOT NULL,
  `IdNivoa` BIGINT UNSIGNED NOT NULL,
  `VrijemePocetka` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `VrijemeZavrsetka` DATETIME(3) NULL DEFAULT NULL,
  `OsvojeniBodovi` INT UNSIGNED NOT NULL DEFAULT '0',
  `MaksimalniBodovi` INT UNSIGNED NOT NULL,
  `Status` ENUM('U_TOKU', 'ZAVRSEN', 'PREKINUT') NOT NULL DEFAULT 'U_TOKU',
  PRIMARY KEY (`IdPokusajaIgre`),
  UNIQUE INDEX `UQ_POKUSAJ_IGRE_NIVO_ID_POKUSAJA` (`IdNivoa` ASC, `IdPokusajaIgre` ASC) VISIBLE,
  INDEX `FK_POKUSAJ_IGRE_IGRAC` (`IdIgraca` ASC) VISIBLE,
  INDEX `FK_POKUSAJ_IGRE_NIVO_IGRICE` (`IdIgrice` ASC, `IdNivoa` ASC) VISIBLE,
  CONSTRAINT `FK_POKUSAJ_IGRE_IGRAC`
    FOREIGN KEY (`IdIgraca`)
    REFERENCES `curiosity_corner`.`igrac` (`IdIgraca`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_POKUSAJ_IGRE_IGRICA`
    FOREIGN KEY (`IdIgrice`)
    REFERENCES `curiosity_corner`.`igrica` (`IdIgrice`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_POKUSAJ_IGRE_NIVO_IGRICE`
    FOREIGN KEY (`IdIgrice` , `IdNivoa`)
    REFERENCES `curiosity_corner`.`nivo` (`IdIgrice` , `IdNivoa`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`pokusaj_aktivnosti`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`pokusaj_aktivnosti` (
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdPokusajaIgre` BIGINT UNSIGNED NOT NULL,
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `RedniBrojPokusaja` INT UNSIGNED NOT NULL,
  `VrijemePocetka` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `VrijemeZavrsetka` DATETIME(3) NULL DEFAULT NULL,
  `JeTacno` TINYINT(1) NULL DEFAULT NULL,
  `OsvojeniBodovi` INT UNSIGNED NOT NULL DEFAULT '0',
  PRIMARY KEY (`IdPokusajaAktivnosti`),
  UNIQUE INDEX `UQ_POKUSAJ_AKTIVNOSTI_REDNI_BROJ` (`IdPokusajaIgre` ASC, `IdAktivnosti` ASC, `RedniBrojPokusaja` ASC) VISIBLE,
  INDEX `FK_POKUSAJ_AKTIVNOSTI_AKTIVNOST` (`IdAktivnosti` ASC) VISIBLE,
  CONSTRAINT `FK_POKUSAJ_AKTIVNOSTI_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_POKUSAJ_AKTIVNOSTI_POKUSAJ_IGRE`
    FOREIGN KEY (`IdPokusajaIgre`)
    REFERENCES `curiosity_corner`.`pokusaj_igre` (`IdPokusajaIgre`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`rezultat_osmosmjerke`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`rezultat_osmosmjerke` (
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `BrojPronadjenihRijeci` INT UNSIGNED NOT NULL,
  `UkupanBrojRijeci` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`IdPokusajaAktivnosti`),
  CONSTRAINT `FK_REZULTAT_OSMOSMJERKE_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE,
  CONSTRAINT `CK_REZULTAT_OSMOSMJERKE_BROJ_RIJECI`
    CHECK (`UkupanBrojRijeci` > 0 AND `BrojPronadjenihRijeci` <= `UkupanBrojRijeci`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`izabrani_par`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`izabrani_par` (
  `IdIzabranogPara` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `IdLijevogPara` BIGINT UNSIGNED NOT NULL,
  `IdIzabranogDesnogPara` BIGINT UNSIGNED NOT NULL,
  `RedniBrojPoteza` INT UNSIGNED NOT NULL,
  `JeTacno` TINYINT(1) NOT NULL,
  PRIMARY KEY (`IdIzabranogPara`),
  UNIQUE INDEX `UQ_IZABRANI_PAR_POTEZ` (`IdPokusajaAktivnosti` ASC, `RedniBrojPoteza` ASC) VISIBLE,
  INDEX `FK_IZABRANI_PAR_LIJEVI` (`IdLijevogPara` ASC) VISIBLE,
  INDEX `FK_IZABRANI_PAR_DESNI` (`IdIzabranogDesnogPara` ASC) VISIBLE,
  CONSTRAINT `FK_IZABRANI_PAR_DESNI`
    FOREIGN KEY (`IdIzabranogDesnogPara`)
    REFERENCES `curiosity_corner`.`par_za_spajanje` (`IdPara`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_IZABRANI_PAR_LIJEVI`
    FOREIGN KEY (`IdLijevogPara`)
    REFERENCES `curiosity_corner`.`par_za_spajanje` (`IdPara`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_IZABRANI_PAR_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`memorija`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`memorija` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `BrojKolona` INT UNSIGNED NOT NULL,
  `VrijemeZaRjesavanje` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Vrijeme u sekundama',
  PRIMARY KEY (`IdAktivnosti`),
  CONSTRAINT `FK_MEMORIJA_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`kartica_memorije`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`kartica_memorije` (
  `IdKartice` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `BrojPara` INT UNSIGNED NOT NULL,
  `idSadrzaja` INT NOT NULL,
  PRIMARY KEY (`IdKartice`),
  UNIQUE INDEX `UQ_KARTICA_MEMORIJE_AKTIVNOST_ID_KARTICE` (`IdAktivnosti` ASC, `IdKartice` ASC) VISIBLE,
  INDEX `fk_kartica_memorije_sadrzaj1_idx` (`idSadrzaja` ASC) VISIBLE,
  CONSTRAINT `FK_KARTICA_MEMORIJE_MEMORIJA`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`memorija` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_kartica_memorije_sadrzaj1`
    FOREIGN KEY (`idSadrzaja`)
    REFERENCES `curiosity_corner`.`sadrzaj` (`idSadrzaja`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`pitanje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`pitanje` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `Objasnjenje` VARCHAR(2000) NULL DEFAULT NULL,
  `idSadrzaja` INT NOT NULL,
  PRIMARY KEY (`IdAktivnosti`),
  INDEX `fk_pitanje_sadrzaj1_idx` (`idSadrzaja` ASC) VISIBLE,
  CONSTRAINT `FK_PITANJE_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_pitanje_sadrzaj1`
    FOREIGN KEY (`idSadrzaja`)
    REFERENCES `curiosity_corner`.`sadrzaj` (`idSadrzaja`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`ponudjeni_odgovor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`ponudjeni_odgovor` (
  `IdPonudjenogOdgovora` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `JeTacan` TINYINT(1) NOT NULL DEFAULT '0',
  `RedniBroj` INT UNSIGNED NOT NULL,
  `idSadrzaja` INT NOT NULL,
  PRIMARY KEY (`IdPonudjenogOdgovora`),
  UNIQUE INDEX `UQ_PONUDJENI_ODGOVOR_REDNI_BROJ` (`IdAktivnosti` ASC, `RedniBroj` ASC) VISIBLE,
  INDEX `fk_ponudjeni_odgovor_sadrzaj1_idx` (`idSadrzaja` ASC) VISIBLE,
  CONSTRAINT `FK_PONUDJENI_ODGOVOR_PITANJE`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`pitanje` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ponudjeni_odgovor_sadrzaj1`
    FOREIGN KEY (`idSadrzaja`)
    REFERENCES `curiosity_corner`.`sadrzaj` (`idSadrzaja`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`odgovor_na_pitanje`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`odgovor_na_pitanje` (
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `IdIzabranogOdgovora` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`IdPokusajaAktivnosti`),
  INDEX `FK_ODGOVOR_NA_PITANJE_ODGOVOR` (`IdIzabranogOdgovora` ASC) VISIBLE,
  CONSTRAINT `FK_ODGOVOR_NA_PITANJE_ODGOVOR`
    FOREIGN KEY (`IdIzabranogOdgovora`)
    REFERENCES `curiosity_corner`.`ponudjeni_odgovor` (`IdPonudjenogOdgovora`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_ODGOVOR_NA_PITANJE_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`recenzija`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`recenzija` (
  `IdRecenzije` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdIgrice` BIGINT UNSIGNED NOT NULL,
  `Ocjena` TINYINT UNSIGNED NOT NULL,
  `Komentar` VARCHAR(3000) NOT NULL,
  `DatumKreiranja` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `DatumIzmjene` DATETIME(3) NULL DEFAULT NULL,
  `idKorisnika` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`IdRecenzije`),
  INDEX `FK_RECENZIJA_IGRICA` (`IdIgrice` ASC) VISIBLE,
  INDEX `fk_recenzija_korisnik1_idx` (`idKorisnika` ASC) VISIBLE,
  CONSTRAINT `FK_RECENZIJA_IGRICA`
    FOREIGN KEY (`IdIgrice`)
    REFERENCES `curiosity_corner`.`igrica` (`IdIgrice`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_recenzija_korisnik1`
    FOREIGN KEY (`idKorisnika`)
    REFERENCES `curiosity_corner`.`korisnik` (`idKorisnika`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`odgovor_na_recenziju`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`odgovor_na_recenziju` (
  `IdOdgovora` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdRecenzije` BIGINT UNSIGNED NOT NULL,
  `IdAdministratora` BIGINT UNSIGNED NOT NULL,
  `TekstOdgovora` VARCHAR(3000) NOT NULL,
  `DatumKreiranja` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `DatumIzmjene` DATETIME(3) NULL DEFAULT NULL,
  PRIMARY KEY (`IdOdgovora`),
  UNIQUE INDEX `UQ_ODGOVOR_NA_RECENZIJU_RECENZIJA` (`IdRecenzije` ASC) VISIBLE,
  INDEX `FK_ODGOVOR_NA_RECENZIJU_ADMINISTRATOR` (`IdAdministratora` ASC) VISIBLE,
  CONSTRAINT `FK_ODGOVOR_NA_RECENZIJU_ADMINISTRATOR`
    FOREIGN KEY (`IdAdministratora`)
    REFERENCES `curiosity_corner`.`administrator` (`IdAdministratora`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_ODGOVOR_NA_RECENZIJU_RECENZIJA`
    FOREIGN KEY (`IdRecenzije`)
    REFERENCES `curiosity_corner`.`recenzija` (`IdRecenzije`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`osmosmjerka`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`osmosmjerka` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `BrojRedova` INT UNSIGNED NOT NULL,
  `BrojKolona` INT UNSIGNED NOT NULL,
  `Mreza` JSON NOT NULL,
  PRIMARY KEY (`IdAktivnosti`),
  CONSTRAINT `FK_OSMOSMJERKA_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`postavljeno_slovo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`postavljeno_slovo` (
  `IdPostavljenogSlova` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `Pozicija` INT UNSIGNED NOT NULL,
  `IzabraniZnak` CHAR(1) NOT NULL,
  `OcekivaniZnak` CHAR(1) NOT NULL,
  `RedniBrojPoteza` INT UNSIGNED NOT NULL,
  `JeTacno` TINYINT(1) NOT NULL,
  PRIMARY KEY (`IdPostavljenogSlova`),
  UNIQUE INDEX `UQ_POSTAVLJENO_SLOVO_POTEZ` (`IdPokusajaAktivnosti` ASC, `RedniBrojPoteza` ASC) VISIBLE,
  CONSTRAINT `FK_POSTAVLJENO_SLOVO_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`potez_memorije`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`potez_memorije` (
  `IdPotezaMemorije` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `IdPrveKartice` BIGINT UNSIGNED NOT NULL,
  `IdDrugeKartice` BIGINT UNSIGNED NOT NULL,
  `RedniBrojPoteza` INT UNSIGNED NOT NULL,
  `JePronadjenPar` TINYINT(1) NOT NULL,
  `VrijemePoteza` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`IdPotezaMemorije`),
  UNIQUE INDEX `UQ_POTEZ_MEMORIJE_POTEZ` (`IdPokusajaAktivnosti` ASC, `RedniBrojPoteza` ASC) VISIBLE,
  INDEX `FK_POTEZ_MEMORIJE_PRVA_KARTICA` (`IdPrveKartice` ASC) VISIBLE,
  INDEX `FK_POTEZ_MEMORIJE_DRUGA_KARTICA` (`IdDrugeKartice` ASC) VISIBLE,
  CONSTRAINT `FK_POTEZ_MEMORIJE_DRUGA_KARTICA`
    FOREIGN KEY (`IdDrugeKartice`)
    REFERENCES `curiosity_corner`.`kartica_memorije` (`IdKartice`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `FK_POTEZ_MEMORIJE_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_POTEZ_MEMORIJE_PRVA_KARTICA`
    FOREIGN KEY (`IdPrveKartice`)
    REFERENCES `curiosity_corner`.`kartica_memorije` (`IdKartice`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`pregled_bajke`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`pregled_bajke` (
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `PosljednjaPozicijaSekunde` INT UNSIGNED NOT NULL DEFAULT '0',
  `JeZavrseno` TINYINT(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`IdPokusajaAktivnosti`),
  CONSTRAINT `FK_PREGLED_BAJKE_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`skrivena_rijec`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`skrivena_rijec` (
  `IdSkriveneRijeci` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `Rijec` VARCHAR(250) NOT NULL,
  `PocetniRed` INT UNSIGNED NOT NULL,
  `PocetnaKolona` INT UNSIGNED NOT NULL,
  `KrajnjiRed` INT UNSIGNED NOT NULL,
  `KrajnjaKolona` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`IdSkriveneRijeci`),
  UNIQUE INDEX `UQ_SKRIVENA_RIJEC_AKTIVNOST_ID_RIJECI` (`IdAktivnosti` ASC, `IdSkriveneRijeci` ASC) VISIBLE,
  UNIQUE INDEX `UQ_SKRIVENA_RIJEC_POZICIJA` (`IdAktivnosti` ASC, `PocetniRed` ASC, `PocetnaKolona` ASC, `KrajnjiRed` ASC, `KrajnjaKolona` ASC) VISIBLE,
  CONSTRAINT `FK_SKRIVENA_RIJEC_OSMOSMJERKA`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`osmosmjerka` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`pronadjena_rijec`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`pronadjena_rijec` (
  `IdPronadjeneRijeci` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `IdSkriveneRijeci` BIGINT UNSIGNED NULL DEFAULT NULL,
  `IzabraniPocetniRed` INT UNSIGNED NOT NULL,
  `IzabranaPocetnaKolona` INT UNSIGNED NOT NULL,
  `IzabraniKrajnjiRed` INT UNSIGNED NOT NULL,
  `IzabranaKrajnjaKolona` INT UNSIGNED NOT NULL,
  `RedniBrojPoteza` INT UNSIGNED NOT NULL,
  `JeTacno` TINYINT(1) NOT NULL,
  PRIMARY KEY (`IdPronadjeneRijeci`),
  UNIQUE INDEX `UQ_PRONADJENA_RIJEC_POTEZ` (`IdPokusajaAktivnosti` ASC, `RedniBrojPoteza` ASC) VISIBLE,
  INDEX `FK_PRONADJENA_RIJEC_SKRIVENA_RIJEC` (`IdSkriveneRijeci` ASC) VISIBLE,
  CONSTRAINT `FK_PRONADJENA_RIJEC_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_PRONADJENA_RIJEC_SKRIVENA_RIJEC`
    FOREIGN KEY (`IdSkriveneRijeci`)
    REFERENCES `curiosity_corner`.`skrivena_rijec` (`IdSkriveneRijeci`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`stavka_razvrstavanja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`stavka_razvrstavanja` (
  `IdStavke` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdTacneGrupe` BIGINT UNSIGNED NOT NULL,
  `idSadrzaja` INT NOT NULL,
  PRIMARY KEY (`IdStavke`),
  INDEX `FK_STAVKA_RAZVRSTAVANJA_TACNA_GRUPA` (`IdTacneGrupe` ASC) VISIBLE,
  INDEX `fk_stavka_razvrstavanja_sadrzaj1_idx` (`idSadrzaja` ASC) VISIBLE,
  CONSTRAINT `FK_STAVKA_RAZVRSTAVANJA_TACNA_GRUPA`
    FOREIGN KEY (`IdTacneGrupe`)
    REFERENCES `curiosity_corner`.`grupa_razvrstavanja` (`IdGrupe`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_stavka_razvrstavanja_sadrzaj1`
    FOREIGN KEY (`idSadrzaja`)
    REFERENCES `curiosity_corner`.`sadrzaj` (`idSadrzaja`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`razvrstana_stavka`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`razvrstana_stavka` (
  `IdRazvrstaneStavke` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `IdPokusajaAktivnosti` BIGINT UNSIGNED NOT NULL,
  `IdStavke` BIGINT UNSIGNED NOT NULL,
  `IdIzabraneGrupe` BIGINT UNSIGNED NOT NULL,
  `RedniBrojPoteza` INT UNSIGNED NOT NULL,
  `JeTacno` TINYINT(1) NOT NULL,
  PRIMARY KEY (`IdRazvrstaneStavke`),
  UNIQUE INDEX `UQ_RAZVRSTANA_STAVKA_POTEZ` (`IdPokusajaAktivnosti` ASC, `RedniBrojPoteza` ASC) VISIBLE,
  INDEX `FK_RAZVRSTANA_STAVKA_STAVKA` (`IdStavke` ASC) VISIBLE,
  INDEX `FK_RAZVRSTANA_STAVKA_GRUPA` (`IdIzabraneGrupe` ASC) VISIBLE,
  CONSTRAINT `FK_RAZVRSTANA_STAVKA_GRUPA`
    FOREIGN KEY (`IdIzabraneGrupe`)
    REFERENCES `curiosity_corner`.`grupa_razvrstavanja` (`IdGrupe`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `FK_RAZVRSTANA_STAVKA_POKUSAJ`
    FOREIGN KEY (`IdPokusajaAktivnosti`)
    REFERENCES `curiosity_corner`.`pokusaj_aktivnosti` (`IdPokusajaAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_RAZVRSTANA_STAVKA_STAVKA`
    FOREIGN KEY (`IdStavke`)
    REFERENCES `curiosity_corner`.`stavka_razvrstavanja` (`IdStavke`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `curiosity_corner`.`slaganje_slova`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `curiosity_corner`.`slaganje_slova` (
  `IdAktivnosti` BIGINT UNSIGNED NOT NULL,
  `CiljniTekst` VARCHAR(500) NOT NULL,
  `PutanjaSlike` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`IdAktivnosti`),
  CONSTRAINT `FK_SLAGANJE_SLOVA_AKTIVNOST`
    FOREIGN KEY (`IdAktivnosti`)
    REFERENCES `curiosity_corner`.`aktivnost` (`IdAktivnosti`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Usklađivanje postojećih baza
-- -----------------------------------------------------
SET @cc_ddl = IF(EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'curiosity_corner' AND TABLE_NAME = 'igrac' AND COLUMN_NAME = 'idAvatara'
), 'DO 0', 'ALTER TABLE igrac ADD COLUMN idAvatara INT NULL DEFAULT NULL');
PREPARE cc_schema FROM @cc_ddl;
EXECUTE cc_schema;
DEALLOCATE PREPARE cc_schema;

SET @cc_ddl = IF(EXISTS (
    SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'curiosity_corner' AND TABLE_NAME = 'igrac'
      AND COLUMN_NAME = 'idAvatara' AND REFERENCED_TABLE_NAME = 'avatar'
), 'DO 0', 'ALTER TABLE igrac ADD CONSTRAINT fk_igrac_avatar1
    FOREIGN KEY (idAvatara) REFERENCES avatar (idAvatara) ON DELETE SET NULL');
PREPARE cc_schema FROM @cc_ddl;
EXECUTE cc_schema;
DEALLOCATE PREPARE cc_schema;

SET @cc_ddl = IF(EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'curiosity_corner' AND TABLE_NAME = 'grupa_razvrstavanja' AND COLUMN_NAME = 'IdSadrzaja'
), 'DO 0', 'ALTER TABLE grupa_razvrstavanja ADD COLUMN IdSadrzaja INT NULL');
PREPARE cc_schema FROM @cc_ddl;
EXECUTE cc_schema;
DEALLOCATE PREPARE cc_schema;

SET @cc_ddl = IF(EXISTS (
    SELECT 1 FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'curiosity_corner' AND TABLE_NAME = 'grupa_razvrstavanja'
      AND COLUMN_NAME = 'IdSadrzaja' AND REFERENCED_TABLE_NAME = 'sadrzaj'
), 'DO 0', 'ALTER TABLE grupa_razvrstavanja ADD CONSTRAINT FK_GRUPA_RAZVRSTAVANJA_SADRZAJ
    FOREIGN KEY (IdSadrzaja) REFERENCES sadrzaj (idSadrzaja)');
PREPARE cc_schema FROM @cc_ddl;
EXECUTE cc_schema;
DEALLOCATE PREPARE cc_schema;

SET @cc_tip_igraca = (
    SELECT COLUMN_TYPE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'curiosity_corner' AND TABLE_NAME = 'recenzija'
      AND COLUMN_NAME = 'IdIgraca' AND IS_NULLABLE = 'NO'
);
SET @cc_ddl = IF(@cc_tip_igraca IS NULL, 'DO 0',
    CONCAT('ALTER TABLE recenzija MODIFY COLUMN IdIgraca ', @cc_tip_igraca, ' NULL DEFAULT NULL'));
PREPARE cc_schema FROM @cc_ddl;
EXECUTE cc_schema;
DEALLOCATE PREPARE cc_schema;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
