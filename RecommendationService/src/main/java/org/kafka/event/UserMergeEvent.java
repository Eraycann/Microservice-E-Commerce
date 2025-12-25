package org.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMergeEvent implements Serializable {
    private String guestId;
    private String userId;
    private long timestamp;
}