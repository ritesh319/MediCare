package com.hospital.service.impl;

import com.hospital.dto.request.LoginRequest;
import com.hospital.dto.request.RegisterRequest;
import com.hospital.dto.response.AuthResponse;
import com.hospital.exception.DuplicateResourceException;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.Role;
import com.hospital.model.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtUtils;
import com.hospital.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail());
        }

        String roleName = "PATIENT".equalsIgnoreCase(request.getRole())
                ? Role.PATIENT : Role.DOCTOR;

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .roles(Set.of(roleName))
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        @SuppressWarnings("null")
        User savedUser = userRepository.save(user);
        String profileId = null;

        if (Role.PATIENT.equals(roleName)) {
            Patient patient = Patient.builder()
                    .userId(savedUser.getId())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            if (patient != null) {
                Patient savedPatient = patientRepository.save(patient);
                profileId = savedPatient != null ? savedPatient.getId() : null;
            }
        } else {
            Doctor doctor = Doctor.builder()
                    .userId(savedUser.getId())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            if (doctor != null) {
                Doctor savedDoctor = doctorRepository.save(doctor);
                profileId = savedDoctor != null ? savedDoctor.getId() : null;
            }
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", savedUser.getRoles());
        claims.put("profileId", profileId);

        String token = jwtUtils.generateToken(savedUser.getEmail(), claims);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .roles(savedUser.getRoles())
                .profileId(profileId)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        String profileId = resolveProfileId(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles());
        claims.put("profileId", profileId);

        String token = jwtUtils.generateToken(user.getEmail(), claims);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .profileId(profileId)
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        String email = jwtUtils.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email).orElseThrow();
        String profileId = resolveProfileId(user);

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles());
        claims.put("profileId", profileId);

        String newToken = jwtUtils.generateToken(email, claims);

        return AuthResponse.builder()
                .token(newToken)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .profileId(profileId)
                .build();
    }

    private String resolveProfileId(User user) {
        if (user.getRoles().contains(Role.PATIENT)) {
            return patientRepository.findByUserId(user.getId())
                    .map(Patient::getId).orElse(null);
        } else if (user.getRoles().contains(Role.DOCTOR)) {
            return doctorRepository.findByUserId(user.getId())
                    .map(Doctor::getId).orElse(null);
        }
        return null;
    }
}
