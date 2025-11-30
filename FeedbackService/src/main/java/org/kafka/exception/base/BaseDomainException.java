package org.kafka.exception.base;

public class BaseDomainException extends RuntimeException {
    private final BaseErrorCode errorCode;

    public BaseDomainException(BaseErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BaseErrorCode getErrorCode() {
        return errorCode;
    }
}
