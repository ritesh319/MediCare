package com.hospital.config;

import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.Role;
import com.hospital.model.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository    userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository  doctorRepository;
    private final PasswordEncoder   passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedSampleDoctor();
        seedSamplePatient();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@hospital.com")) {
            log.info("Admin already exists, skipping.");
            return;
        }
        User admin = User.builder()
                .email("admin@hospital.com")
                .password(passwordEncoder.encode("admin1234"))
                .firstName("System")
                .lastName("Admin")
                .phone("+10000000000")
                .roles(Set.of(Role.ADMIN))
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        if (admin != null) {
            userRepository.save(admin);
        }
        log.info("Admin seeded: admin@hospital.com / admin1234");
    }

    @SuppressWarnings("null")
    private void seedSampleDoctor() {
        final String email     = "doctor@hospital.com";
        final String firstName = "Harshdeep";
        final String lastName  = "Kaur";

        User doctorUser;
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            doctorUser = existingUser.get();
            doctorUser.setFirstName(firstName);
            doctorUser.setLastName(lastName);
            doctorUser.setUpdatedAt(LocalDateTime.now());
            doctorUser = userRepository.save(doctorUser);
            log.info("Doctor user record updated to {} {}", firstName, lastName);
        } else {
            doctorUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode("doctor123"))
                    .firstName(firstName)
                    .lastName(lastName)
                    .phone("+11234567890")
                    .roles(Set.of(Role.DOCTOR))
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            doctorUser = userRepository.save(doctorUser);
            log.info("Doctor user created: {}", email);
        }

        Optional<Doctor> existingDoctor = doctorRepository.findByUserId(doctorUser.getId());
        if (existingDoctor.isPresent()) {
            Doctor d = existingDoctor.get();
            d.setFirstName(firstName);
            d.setLastName(lastName);
            d.setUpdatedAt(LocalDateTime.now());
            doctorRepository.save(d);
            log.info("Doctor profile updated to {} {}", firstName, lastName);
        } else {
            Doctor doctor = Doctor.builder()
                    .userId(doctorUser.getId())
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .phone("+11234567890")
                    .specialization("Cardiology")
                    .qualification("MBBS, MD (Cardiology)")
                    .licenseNumber("MED-CAR-2019")
                    .experienceYears(8)
                    .department("Cardiology")
                    .bio("Board-certified cardiologist specialising in preventive and interventional cardiology.")
                    .consultationFee(150.0)
                    .active(true)
                    .availabilitySchedule(List.of(
                        Doctor.Availability.builder().dayOfWeek("MONDAY").startTime("09:00").endTime("17:00").slotDurationMinutes(30).available(true).build(),
                        Doctor.Availability.builder().dayOfWeek("TUESDAY").startTime("09:00").endTime("17:00").slotDurationMinutes(30).available(true).build(),
                        Doctor.Availability.builder().dayOfWeek("WEDNESDAY").startTime("09:00").endTime("13:00").slotDurationMinutes(30).available(true).build(),
                        Doctor.Availability.builder().dayOfWeek("THURSDAY").startTime("09:00").endTime("17:00").slotDurationMinutes(30).available(true).build(),
                        Doctor.Availability.builder().dayOfWeek("FRIDAY").startTime("09:00").endTime("15:00").slotDurationMinutes(30).available(true).build(),
                        Doctor.Availability.builder().dayOfWeek("SATURDAY").startTime("10:00").endTime("13:00").slotDurationMinutes(30).available(false).build(),
                        Doctor.Availability.builder().dayOfWeek("SUNDAY").startTime("10:00").endTime("13:00").slotDurationMinutes(30).available(false).build()
                    ))
                    .rating(4.8)
                    .totalReviews(120)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            if (doctor != null) {
                doctorRepository.save(doctor);
            }
            log.info("Doctor profile RECREATED for {} {}", firstName, lastName);
        }
    }

    @SuppressWarnings("null")
    private void seedSamplePatient() {
        final String email     = "patient@hospital.com";
        final String firstName = "Kabir";
        final String lastName  = "Choudhury";

        User patientUser;
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            patientUser = existingUser.get();
            patientUser.setFirstName(firstName);
            patientUser.setLastName(lastName);
            patientUser.setUpdatedAt(LocalDateTime.now());
            patientUser = userRepository.save(patientUser);
            log.info("Patient user record updated to {} {}", firstName, lastName);
        } else {
            patientUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode("patient123"))
                    .firstName(firstName)
                    .lastName(lastName)
                    .phone("+19876543210")
                    .roles(Set.of(Role.PATIENT))
                    .enabled(true)
                    .accountNonExpired(true)
                    .accountNonLocked(true)
                    .credentialsNonExpired(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            patientUser = userRepository.save(patientUser);
            log.info("Patient user created: {}", email);
        }

        Optional<Patient> existingPatient = patientRepository.findByUserId(patientUser.getId());
        if (existingPatient.isPresent()) {
            Patient p = existingPatient.get();
            p.setFirstName(firstName);
            p.setLastName(lastName);
            p.setUpdatedAt(LocalDateTime.now());
            patientRepository.save(p);
            log.info("Patient profile updated to {} {}", firstName, lastName);
        } else {
            Patient patient = Patient.builder()
                    .userId(patientUser.getId())
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .phone("+19876543210")
                    .gender("Male")
                    .bloodGroup("O+")
                    .allergies(List.of("Penicillin", "Aspirin"))
                    .currentMedications(List.of("Atorvastatin 20mg"))
                    .address(Patient.Address.builder()
                            .street("123 Main Street")
                            .city("Guwahati")
                            .state("Assam")
                            .zipCode("781001")
                            .country("India")
                            .build())
                    .emergencyContact(Patient.EmergencyContact.builder()
                            .name("Mustafa")
                            .relationship("Spouse")
                            .phone("+19876500001")
                            .build())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            patientRepository.save(patient);
            log.info("Patient profile RECREATED for {} {}", firstName, lastName);
        }
    }
}
