package com.motelmanagement.util;

public final class NoiDungEmail {

    private final String plain;
    private final String html;

    public NoiDungEmail(String plain, String html) {
        this.plain = plain;
        this.html = html;
    }

    public String plain() {
        return plain;
    }

    public String html() {
        return html;
    }
}
